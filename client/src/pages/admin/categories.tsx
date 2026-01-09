import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/card";
import {
  FaAd,
  FaTh,
  FaHamburger,
  FaAlignLeft,
  FaWindowRestore,
} from "react-icons/fa";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useQuery } from "@tanstack/react-query";
import { AdSlot } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

// Define the 4 default categories mapping to database ad types
const AD_CATEGORIES = [
  {
    id: "banner",
    label: "Banner",
    description: "Full-width banner ads at top, bottom, or middle of pages",
    icon: FaTh,
    color: "bg-blue-50 text-blue-600",
    src: "/banner-ads.jpeg",
    alt: "Banner Ads Preview"
  },
  {
    id: "sidebar",
    label: "Sidebar",
    description: "Vertical sidebar ads positioned on the right side of content",
    icon: FaHamburger,
    color: "bg-green-50 text-green-600",
    src: "/sidebar-ads.jpeg",
    alt: "Sidebar Ads Preview"
  },
  {
    id: "inline",
    label: "Inline",
    description: "In-content ads placed within article text and feeds",
    icon: FaAlignLeft,
    color: "bg-purple-50 text-purple-600",
    src: "/inline-article-ads.jpeg",
    alt: "Inline Article Ads Preview"
  },
  {
    id: "popup",
    label: "Popup",
    description: "Pop-up and modal ads for high-impact advertising",
    icon: FaWindowRestore,
    color: "bg-orange-50 text-orange-600",
    src: "/popup-ads.jpeg",
    alt: "Popup Ads Preview"
  },
];

export default function AdminAdSlotsVisual() {
  const { data: slots, isLoading } = useQuery<AdSlot[]>({
    queryKey: ["/api/ad-slots"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(Number(amount));
  };

  return (
    <div className="min-h-screen">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
              Ad Slots
            </h2>
            <p className="text-muted-foreground">
              Overview of available ad slots by category
            </p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading slots...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {AD_CATEGORIES.map((category) => {
                const categorySlots = slots?.filter(s => s.adType === category.id) || [];

                return (
                  <Link key={category.id} href={`/ad-categories/${category.id}/slots`}>
                    <a className="block h-full">
                      <Card
                        className="p-6 hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full cursor-pointer hover:border-primary/50"
                      >
                        <div className="flex flex-col gap-4">
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={category.src}
                              alt={category.alt}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          </AspectRatio>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-foreground text-lg">
                                {category.label}
                              </h4>
                              <Badge variant="secondary">
                                {categorySlots.length} Slots
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description}
                            </p>
                          </div>

                          <div className="mt-auto pt-4 border-t">
                            <div className="flex items-center text-sm text-primary font-medium">
                              View {categorySlots.length} available slots
                            </div>
                          </div>
                        </div>
                      </Card>
                    </a>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
