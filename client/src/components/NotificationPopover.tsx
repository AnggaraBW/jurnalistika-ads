import { useState } from "react";
import { Bell, Check, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export function NotificationPopover() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [, setLocation] = useLocation();
    const { user } = useAuth();

    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ["/api/notifications"],
        // Refresh every 30 seconds
        refetchInterval: 30000,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("PATCH", `/api/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/notifications/mark-all-read");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
        },
    });

    const handleMarkRead = (id: string) => {
        markReadMutation.mutate(id);
    };

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
    };

    const handleNotificationClick = (notification: Notification) => {
        console.log('notification', notification);


        if (!notification.isRead) {
            handleMarkRead(notification.id);
        }
        setOpen(false);

        if (notification.adId) {
            if (user?.role === 'admin') {
                setLocation(`/ads/${notification.adId}`);
            } else {
                setLocation(`/advertiser/${notification.adId}`);
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifikasi</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto py-1 px-2"
                            onClick={handleMarkAllRead}
                            disabled={markAllReadMutation.isPending}
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Memuat...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Tidak ada notifikasi
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? "bg-muted/20" : ""
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${!notification.isRead ? "bg-primary" : "bg-transparent"
                                            }`} />
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!notification.isRead ? "font-semibold" : ""}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground pt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                    locale: id,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
