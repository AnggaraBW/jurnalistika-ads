import {
  users,
  adSlots,
  ads,
  adViews,
  adSlotBookings,
  notifications,
  type User,
  type UpsertUser,
  type AdSlot,
  type InsertAdSlot,
  type Ad,
  type InsertAd,
  type AdWithRelations,
  type AdWithAnalytics,
  type UpdateAdStatus,
  type InsertAdView,
  type AdView,
  type UpdateAdSlot,
  type Notification,
  type InsertNotification,
  adTypes,
  type AdType,
  type InsertAdType,
  type UpdateAd,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc, count, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Ad Slot operations
  getAdSlots(): Promise<AdSlot[]>;
  getAvailableAdSlots(): Promise<AdSlot[]>;
  getAdSlotById(id: string): Promise<AdSlot | undefined>;
  createAdSlot(slot: InsertAdSlot): Promise<AdSlot>;
  updateAdSlot(id: string, slot: UpdateAdSlot): Promise<AdSlot>;
  updateAdSlotAvailability(id: string, isAvailable: number): Promise<void>;
  deleteAdSlot(id: string): Promise<void>;

  // Ad operations
  createAd(ad: InsertAd): Promise<Ad>;
  getAdById(id: string): Promise<AdWithRelations | undefined>;
  getAdsByAdvertiser(advertiserId: string): Promise<AdWithRelations[]>;
  getPendingAds(): Promise<AdWithRelations[]>;
  getActiveAds(): Promise<AdWithRelations[]>;
  getAllAds(): Promise<AdWithRelations[]>;
  updateAd(id: string, ad: UpdateAd): Promise<Ad>;
  updateAdStatus(id: string, data: UpdateAdStatus): Promise<Ad>;
  updateAdViews(id: string, views: number): Promise<void>;

  // View tracking
  trackAdView(adId: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<AdView>;
  getAdAnalytics(adId: string): Promise<{
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
  }>;
  getAdvertiserAdsWithAnalytics(advertiserId: string): Promise<AdWithAnalytics[]>;

  // Booking conflict checking
  getBookedDatesForSlot(slotId: string): Promise<Array<{ startDate: Date; endDate: Date; adId: string }>>;
  checkSlotAvailability(slotId: string, startDate: Date, endDate: Date): Promise<boolean>;

  // Statistics
  getStatistics(): Promise<{
    pendingCount: number;
    activeCount: number;
    advertiserCount: number;
    monthlyRevenue: string;
  }>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getAdmins(): Promise<User[]>;

  // Ad Type operations
  getAdTypes(): Promise<AdType[]>;
  createAdType(adType: InsertAdType): Promise<AdType>;
  deleteAdType(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Ad Slot operations
  async getAdSlots(): Promise<AdSlot[]> {
    return await db.select().from(adSlots);
  }

  async getAvailableAdSlots(): Promise<AdSlot[]> {
    return await db.select().from(adSlots).where(eq(adSlots.isAvailable, 1));
  }

  async getAdSlotById(id: string): Promise<AdSlot | undefined> {
    const [slot] = await db.select().from(adSlots).where(eq(adSlots.id, id));
    return slot;
  }

  async createAdSlot(slot: InsertAdSlot): Promise<AdSlot> {
    const [newSlot] = await db.insert(adSlots).values(slot).returning();
    return newSlot;
  }

  async updateAdSlot(id: string, slot: UpdateAdSlot): Promise<AdSlot> {
    const [updatedSlot] = await db
      .update(adSlots)
      .set({ ...slot })
      .where(eq(adSlots.id, id))
      .returning();
    return updatedSlot;
  }

  async updateAdSlotAvailability(id: string, isAvailable: number): Promise<void> {
    await db.update(adSlots).set({ isAvailable }).where(eq(adSlots.id, id));
  }

  async deleteAdSlot(id: string): Promise<void> {
    await db.delete(adSlots).where(eq(adSlots.id, id));
  }

  // Ad operations
  async createAd(ad: InsertAd): Promise<Ad> {
    // Extract slotIds and create ad without it
    const { slotIds, ...adData } = ad;

    // Create the ad
    const [newAd] = await db.insert(ads).values(adData as any).returning();

    // Create bookings for all selected slots
    if (slotIds && slotIds.length > 0) {
      await db.insert(adSlotBookings).values(
        slotIds.map(slotId => ({
          adId: newAd.id,
          slotId,
        }))
      );
    }

    return newAd;
  }

  async updateAd(id: string, ad: UpdateAd): Promise<Ad> {
    const [updatedAd] = await db
      .update(ads)
      .set({ ...ad, updatedAt: new Date() })
      .where(eq(ads.id, id))
      .returning();
    return updatedAd;
  }

  async getAdById(id: string): Promise<AdWithRelations | undefined> {
    const [ad] = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .where(eq(ads.id, id));

    if (!ad) return undefined;

    // Fetch all slots for this ad
    const slots = await db
      .select({ slot: adSlots })
      .from(adSlotBookings)
      .leftJoin(adSlots, eq(adSlotBookings.slotId, adSlots.id))
      .where(eq(adSlotBookings.adId, id));

    return {
      ...ad.ads,
      advertiser: ad.users!,
      slots: slots.map(s => s.slot!),
    };
  }

  async getAdsByAdvertiser(advertiserId: string): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .where(eq(ads.advertiserId, advertiserId))
      .orderBy(desc(ads.createdAt));

    // Fetch slots for all ads
    const adIds = results.map(r => r.ads.id);
    const allSlots = adIds.length > 0 ? await db
      .select({
        adId: adSlotBookings.adId,
        slot: adSlots,
      })
      .from(adSlotBookings)
      .leftJoin(adSlots, eq(adSlotBookings.slotId, adSlots.id))
      .where(inArray(adSlotBookings.adId, adIds)) : [];

    // Group slots by adId
    const slotsByAdId = new Map<string, AdSlot[]>();
    for (const { adId, slot } of allSlots) {
      if (!slotsByAdId.has(adId)) {
        slotsByAdId.set(adId, []);
      }
      if (slot) {
        slotsByAdId.get(adId)!.push(slot);
      }
    }

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slots: slotsByAdId.get(r.ads.id) || [],
    }));
  }

  async getPendingAds(): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .where(eq(ads.status, 'pending'))
      .orderBy(desc(ads.createdAt));

    const adIds = results.map(r => r.ads.id);
    const allSlots = adIds.length > 0 ? await db
      .select({ adId: adSlotBookings.adId, slot: adSlots })
      .from(adSlotBookings)
      .leftJoin(adSlots, eq(adSlotBookings.slotId, adSlots.id))
      .where(inArray(adSlotBookings.adId, adIds)) : [];

    const slotsByAdId = new Map<string, AdSlot[]>();
    for (const { adId, slot } of allSlots) {
      if (!slotsByAdId.has(adId)) slotsByAdId.set(adId, []);
      if (slot) slotsByAdId.get(adId)!.push(slot);
    }

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slots: slotsByAdId.get(r.ads.id) || [],
    }));
  }

  async getActiveAds(): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .where(eq(ads.status, 'active'))
      .orderBy(desc(ads.createdAt));

    const adIds = results.map(r => r.ads.id);
    const allSlots = adIds.length > 0 ? await db
      .select({ adId: adSlotBookings.adId, slot: adSlots })
      .from(adSlotBookings)
      .leftJoin(adSlots, eq(adSlotBookings.slotId, adSlots.id))
      .where(inArray(adSlotBookings.adId, adIds)) : [];

    const slotsByAdId = new Map<string, AdSlot[]>();
    for (const { adId, slot } of allSlots) {
      if (!slotsByAdId.has(adId)) slotsByAdId.set(adId, []);
      if (slot) slotsByAdId.get(adId)!.push(slot);
    }

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slots: slotsByAdId.get(r.ads.id) || [],
    }));
  }

  async getAllAds(): Promise<AdWithRelations[]> {
    const results = await db
      .select()
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .orderBy(desc(ads.createdAt));

    const adIds = results.map(r => r.ads.id);
    const allSlots = adIds.length > 0 ? await db
      .select({ adId: adSlotBookings.adId, slot: adSlots })
      .from(adSlotBookings)
      .leftJoin(adSlots, eq(adSlotBookings.slotId, adSlots.id))
      .where(inArray(adSlotBookings.adId, adIds)) : [];

    const slotsByAdId = new Map<string, AdSlot[]>();
    for (const { adId, slot } of allSlots) {
      if (!slotsByAdId.has(adId)) slotsByAdId.set(adId, []);
      if (slot) slotsByAdId.get(adId)!.push(slot);
    }

    return results.map(r => ({
      ...r.ads,
      advertiser: r.users!,
      slots: slotsByAdId.get(r.ads.id) || [],
    }));
  }

  async updateAdStatus(id: string, data: UpdateAdStatus): Promise<Ad> {
    const [updatedAd] = await db
      .update(ads)
      .set({
        status: data.status,
        rejectionReason: data.rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(ads.id, id))
      .returning();
    return updatedAd;
  }

  async updateAdViews(id: string, views: number): Promise<void> {
    await db
      .update(ads)
      .set({ currentViews: views })
      .where(eq(ads.id, id));
  }

  // View tracking
  async trackAdView(adId: string, ipAddress?: string, userAgent?: string, referrer?: string): Promise<AdView> {
    const [view] = await db.insert(adViews).values({
      adId,
      ipAddress,
      userAgent,
      referrer,
    }).returning();

    // Update current views count
    await db.update(ads)
      .set({ currentViews: sql`${ads.currentViews} + 1` })
      .where(eq(ads.id, adId));

    return view;
  }

  async getAdAnalytics(adId: string): Promise<{
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
  }> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(eq(adViews.adId, adId));

    const [today] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(and(eq(adViews.adId, adId), gte(adViews.viewedAt, startOfDay)));

    const [week] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(and(eq(adViews.adId, adId), gte(adViews.viewedAt, startOfWeek)));

    const [month] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adViews)
      .where(and(eq(adViews.adId, adId), gte(adViews.viewedAt, startOfMonth)));

    return {
      totalViews: total?.count || 0,
      viewsToday: today?.count || 0,
      viewsThisWeek: week?.count || 0,
      viewsThisMonth: month?.count || 0,
    };
  }

  async getAdvertiserAdsWithAnalytics(advertiserId: string): Promise<AdWithAnalytics[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const results = await db
      .select({
        ad: ads,
        advertiser: users,
        viewCount: sql<number>`count(${adViews.id})::int`,
        viewsToday: sql<number>`count(case when ${adViews.viewedAt} >= ${startOfDay.toISOString()} then 1 end)::int`,
      })
      .from(ads)
      .leftJoin(users, eq(ads.advertiserId, users.id))
      .leftJoin(adViews, eq(ads.id, adViews.adId))
      .where(eq(ads.advertiserId, advertiserId))
      .groupBy(ads.id, users.id)
      .orderBy(desc(ads.createdAt));

    // Fetch slots for all ads
    const adIds = results.map(r => r.ad.id);
    const allSlots = adIds.length > 0 ? await db
      .select({ adId: adSlotBookings.adId, slot: adSlots })
      .from(adSlotBookings)
      .leftJoin(adSlots, eq(adSlotBookings.slotId, adSlots.id))
      .where(inArray(adSlotBookings.adId, adIds)) : [];

    const slotsByAdId = new Map<string, AdSlot[]>();
    for (const { adId, slot } of allSlots) {
      if (!slotsByAdId.has(adId)) slotsByAdId.set(adId, []);
      if (slot) slotsByAdId.get(adId)!.push(slot);
    }

    return results.map(r => ({
      ...r.ad,
      advertiser: r.advertiser!,
      slots: slotsByAdId.get(r.ad.id) || [],
      viewCount: r.viewCount || 0,
      viewsToday: r.viewsToday || 0,
    }));
  }

  // Booking conflict checking
  async getBookedDatesForSlot(slotId: string): Promise<Array<{ startDate: Date; endDate: Date; adId: string }>> {
    const bookedAds = await db
      .select({
        adId: ads.id,
        startDate: ads.startDate,
        endDate: ads.endDate,
      })
      .from(adSlotBookings)
      .leftJoin(ads, eq(adSlotBookings.adId, ads.id))
      .where(
        and(
          eq(adSlotBookings.slotId, slotId),
          sql`${ads.status} IN ('pending', 'approved', 'active')`
        )
      );

    return bookedAds
      .filter(ad => ad.adId && ad.startDate && ad.endDate)
      .map(ad => ({
        adId: ad.adId!,
        startDate: ad.startDate!,
        endDate: ad.endDate!,
      }));
  }

  async checkSlotAvailability(slotId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingAds = await db
      .select({ id: ads.id })
      .from(adSlotBookings)
      .leftJoin(ads, eq(adSlotBookings.adId, ads.id))
      .where(
        and(
          eq(adSlotBookings.slotId, slotId),
          sql`${ads.status} IN ('pending', 'approved', 'active')`,
          sql`(${ads.startDate}, ${ads.endDate}) OVERLAPS (${startDate}::date, ${endDate}::date)`
        )
      )
      .limit(1);

    return conflictingAds.length === 0;
  }

  // Statistics
  async getStatistics(): Promise<{
    pendingCount: number;
    activeCount: number;
    advertiserCount: number;
    monthlyRevenue: string;
  }> {
    const [pendingResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ads)
      .where(eq(ads.status, 'pending'));

    const [activeResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ads)
      .where(eq(ads.status, 'active'));

    const [advertiserResult] = await db
      .select({ count: sql<number>`count(distinct ${users.id})::int` })
      .from(users)
      .where(eq(users.role, 'advertiser'));

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [revenueResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${ads.actualCost}), 0)::text`
      })
      .from(ads)
      .where(
        and(
          gte(ads.createdAt, currentMonth),
          eq(ads.status, 'active')
        )
      );

    return {
      pendingCount: pendingResult?.count || 0,
      activeCount: activeResult?.count || 0,
      advertiserCount: advertiserResult?.count || 0,
      monthlyRevenue: revenueResult?.total || '0',
    };
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.userId, userId));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getAdmins(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'admin'));
  }

  // Ad Type operations
  async getAdTypes(): Promise<AdType[]> {
    return await db.select().from(adTypes).where(eq(adTypes.isActive, 1));
  }

  async createAdType(adType: InsertAdType): Promise<AdType> {
    const [newType] = await db.insert(adTypes).values(adType).returning();
    return newType;
  }

  async deleteAdType(id: string): Promise<void> {
    await db.update(adTypes).set({ isActive: 0 }).where(eq(adTypes.id, id));
  }
}

export const storage = new DatabaseStorage();
