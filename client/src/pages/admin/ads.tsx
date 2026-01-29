import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AdWithRelations } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaCheckCircle,
  FaClock,
  FaImage,
  FaPause,
  FaTimesCircle,
  FaPrint,
} from "react-icons/fa";
import { Link } from "wouter";

export default function AdminAds() {
  const { data: ads = [], isLoading } = useQuery<AdWithRelations[]>({
    queryKey: ["/api/ads/all"],
  });

  const isNew = (date: string | Date) => {
    const created = new Date(date);
    const now = new Date();
    return (now.getTime() - created.getTime()) < (24 * 60 * 60 * 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">
            <FaClock className="inline mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">
            <FaCheckCircle className="inline mr-1" />
            Disetujui
          </Badge>
        );
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
            <FaCheckCircle className="inline mr-1" />
            Aktif
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 border-none">
            <FaTimesCircle className="inline mr-1" />
            Ditolak
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-none">
            <FaPause className="inline mr-1" />
            Dijeda
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-none">
            <FaCheckCircle className="inline mr-1" />
            Selesai
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Screen View */}
      <div className="print:hidden">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                Semua Iklan
              </h2>
              <p className="text-muted-foreground">Kelola semua iklan</p>
            </div>
            {ads.length > 0 && (
              <Button onClick={handlePrint} variant="outline" className="gap-2">
                <FaPrint />
                Cetak Laporan
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Memuat iklan...</p>
            </div>
          ) : ads.length === 0 ? (
            <Card className="p-12 text-center">
              <FaImage className="text-6xl text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Belum Ada Iklan
              </h3>
              <p className="text-muted-foreground mb-6">
                Anda belum membuat iklan apapun
              </p>
              <a
                href="/advertiser/create-ad"
                data-testid="link-create-first-ad"
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:opacity-90 transition-opacity"
              >
                Buat Iklan Pertama
              </a>
            </Card>
          ) : (
            <div className="space-y-4">
              {ads.map((ad: any) => (
                <Card
                  key={ad.id}
                  className="p-6 hover:bg-muted/50 transition-colors"
                >
                  <Link href={"/ads/" + ad.id}>
                    <div className="flex items-start justify-between mb-4 cursor-pointer">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          {ad.imageUrl ? (
                            <AspectRatio
                              className="flex justify-center items-center rounded-lg overflow-hidden"
                              ratio={1 / 1}
                            >
                              <img
                                className="w-full h-full object-cover"
                                src={ad.imageUrl}
                                alt="ad view"
                              />
                            </AspectRatio>
                          ) : (
                            <FaImage className="text-3xl text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-lg font-semibold text-foreground mb-1"
                            data-testid={`text-ad-title-${ad.id}`}
                          >
                            {ad.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span
                              className="capitalize"
                              data-testid={`text-ad-slots-${ad.id}`}
                            >
                              {ad.slots?.map((s: any) => s.name).join(", ") ||
                                ad.adType}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{ad.paymentType === 'period' ? 'Per Periode' : 'Per Tayangan'}</span>
                            <span>•</span>
                            <span>
                              {new Date(ad.startDate).toLocaleDateString("id-ID")} -{" "}
                              {new Date(ad.endDate).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(ad.status)}
                            {ad.status === 'pending' && isNew(ad.createdAt) && (
                              <Badge className="bg-blue-500 hover:bg-blue-600 border-none text-white animate-pulse">
                                New
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              Views: {ad.currentViews.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          Budget / Biaya
                        </p>
                        <p className="text-xl font-bold text-foreground font-mono">
                          Rp {parseFloat(ad.budget).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Actual: Rp {parseFloat(ad.actualCost || "0").toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                  </Link>
                  {ad.status === "rejected" && ad.rejectionReason && (
                    <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <p className="text-sm font-medium text-destructive mb-1">
                        Alasan Penolakan:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ad.rejectionReason}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Print View */}
      <div className="hidden print:block p-8 bg-white text-black">
        <div className="flex items-center space-x-4 mb-8">
          <h1 className="text-3xl font-bold">Laporan Iklan Jurnalistika Ads</h1>
        </div>

        <div className="flex justify-between items-end mb-6 border-b pb-4">
          <div>
            <p className="text-sm text-gray-600">Dicetak pada:</p>
            <p className="font-medium">{new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Iklan:</p>
            <p className="font-bold text-xl">{ads.length}</p>
          </div>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-left w-12">No</th>
              <th className="py-2 text-left">Detail Iklan</th>
              <th className="py-2 text-left">Advertiser</th>
              <th className="py-2 text-left">Periode</th>
              <th className="py-2 text-center">Status</th>
              <th className="py-2 text-right">Views</th>
              <th className="py-2 text-right">Biaya (Act/Est)</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad: any, index: number) => (
              <tr key={ad.id} className="border-b border-gray-200">
                <td className="py-3 align-top">{index + 1}</td>
                <td className="py-3 align-top">
                  <p className="font-bold mb-1">{ad.title}</p>
                  <p className="text-xs text-gray-600 capitalize">
                    Tipe: {ad.adType} • {ad.paymentType === 'period' ? 'Periode' : 'Tayangan'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {ad.slots?.map((s: any) => s.name).join(", ")}
                  </p>
                </td>
                <td className="py-3 align-top">
                  <p className="font-medium">{ad.advertiser?.companyName || "N/A"}</p>
                  <p className="text-xs text-gray-600">{ad.advertiser?.firstName} {ad.advertiser?.lastName}</p>
                </td>
                <td className="py-3 align-top">
                  <p>{new Date(ad.startDate).toLocaleDateString("id-ID")}</p>
                  <p className="text-gray-500 text-xs text-center">s/d</p>
                  <p>{new Date(ad.endDate).toLocaleDateString("id-ID")}</p>
                </td>
                <td className="py-3 align-top text-center">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase
                                ${ad.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                                ${ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${ad.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                                ${ad.status === 'completed' ? 'bg-slate-100 text-slate-800' : ''}
                                ${ad.status === 'approved' ? 'bg-blue-100 text-blue-800' : ''}
                            `}>
                    {ad.status}
                  </span>
                </td>
                <td className="py-3 align-top text-right">
                  {ad.currentViews.toLocaleString("id-ID")}
                </td>
                <td className="py-3 align-top text-right">
                  <p className="font-medium">Rp {parseFloat(ad.actualCost || "0").toLocaleString("id-ID")}</p>
                  <p className="text-xs text-gray-500">Est: Rp {parseFloat(ad.estimatedCost || ad.budget).toLocaleString("id-ID")}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 pt-8 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Jurnalistika Ads - Platform Manajemen Iklan</p>
        </div>
      </div>
    </div>
  );
}
