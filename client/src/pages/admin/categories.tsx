import AdminNav from "@/components/AdminNav";
import { Card } from "@/components/ui/card";
import {
  FaAd,
  FaTh,
  FaHamburger,
  FaAlignLeft,
  FaWindowRestore,
  FaCloudUploadAlt,
  FaCheck,
} from "react-icons/fa";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { PutBlobResult } from "@vercel/blob";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdSlot, AdType, InsertAdType, insertAdTypeSchema } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";  // assuming this exists, valid since using shadcn
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const handleGetUploadParameters = async (file: any) => {
    const safeFileName = (file?.name ?? "").trim() || `upload-${Date.now()}`;
    const query = new URLSearchParams({ filename: safeFileName });
    return `/api/blob/upload?${query.toString()}`;
  };

  const handleUploadComplete = (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => {
    if (!result.successful || result.successful.length === 0) {
      toast({
        title: "Gagal",
        description: "Upload gambar gagal. Silakan coba lagi.",
        variant: "destructive",
      });
      return;
    }

    const successfulFile = result.successful[0] as any;
    const responseBody = successfulFile?.response?.body as
      | PutBlobResult
      | undefined;
    const blobUrl = responseBody?.url || successfulFile?.uploadURL;

    if (!blobUrl) {
      toast({
        title: "Gagal",
        description: "Tidak dapat mendapatkan URL gambar.",
        variant: "destructive",
      });
      return;
    }
    setUploadedImageUrl(blobUrl);
    form.setValue("imageUrl", blobUrl);
    toast({
      title: "Success",
      description: "Image uploaded successfully",
    });
  };

  const { data: slots, isLoading: isLoadingSlots } = useQuery<AdSlot[]>({
    queryKey: ["/api/ad-slots"],
  });

  const { data: adTypes, isLoading: isLoadingTypes } = useQuery<AdType[]>({
    queryKey: ["/api/ad-types"],
  });

  const isLoading = isLoadingSlots || isLoadingTypes;

  const form = useForm<InsertAdType>({
    resolver: zodResolver(insertAdTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAdType) => {
      const res = await apiRequest("POST", "/api/ad-types", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-types"] });
      setIsOpen(false);
      form.reset();
      setUploadedImageUrl("");
      toast({
        title: "Success",
        description: "Ad type created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ad-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ad-types"] });
      toast({
        title: "Success",
        description: "Ad type deleted",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: InsertAdType) => {
    createMutation.mutate(data);
  };

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
              Ad Types & Slots
            </h2>
            <p className="text-muted-foreground">
              Manage ad types and their associated slots
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Ad Type</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (e.g. Banner, Sticky Footer)</FormLabel>
                        <FormControl>
                          <Input placeholder="Banner" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Description of this ad type..." {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preview Image</FormLabel>
                        <FormControl>
                          <div>
                            {!uploadedImageUrl ? (
                              <ObjectUploader
                                adType="generic"
                                maxNumberOfFiles={1}
                                maxFileSize={5242880}
                                onGetUploadParameters={handleGetUploadParameters}
                                onComplete={handleUploadComplete}
                                buttonClassName="w-full"
                                buttonVariant="unstyled"
                              >
                                <div className="group border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted hover:border-primary/50 transition-colors cursor-pointer">
                                  <div className="w-12 h-12 bg-muted group-hover:bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FaCloudUploadAlt className="text-2xl text-muted-foreground" />
                                  </div>
                                  <p className="text-sm font-medium text-foreground mb-1">
                                    Click to upload preview
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG (max 5MB)
                                  </p>
                                </div>
                              </ObjectUploader>
                            ) : (
                              <div className="relative border rounded-lg overflow-hidden group">
                                <AspectRatio ratio={16 / 9} className="bg-muted">
                                  <img
                                    src={uploadedImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </AspectRatio>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setUploadedImageUrl("");
                                      form.setValue("imageUrl", "");
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Type
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading slots...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {adTypes?.map((category) => {
                const categorySlots = slots?.filter(s => s.adType === category.name) || [];
                // Fallback image/icon logic could go here

                return (
                  <Card
                    key={category.id}
                    className="flex flex-col h-full hover:shadow-lg transition-shadow overflow-hidden border-border/50"
                  >
                    <div className="relative">
                      <AspectRatio ratio={16 / 9} className="bg-muted flex items-center justify-center">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaAd className="w-16 h-16 text-muted-foreground/50" />
                        )}
                      </AspectRatio>
                      <div className="absolute top-2 right-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will soft-delete the ad type.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(category.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    <Link href={`/ad-categories/${category.name}/slots`}>
                      <a className="block flex-1 p-6 cursor-pointer">
                        <div className="flex flex-col gap-4 h-full">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-foreground text-lg">
                                {category.name}
                              </h4>
                              <Badge variant="secondary">
                                {categorySlots.length} Slots
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description || "No description provided."}
                            </p>
                          </div>

                          <div className="mt-auto pt-4 border-t">
                            <div className="flex items-center text-sm text-primary font-medium">
                              View {categorySlots.length} available slots
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </Card>
                );
              })}
              {adTypes?.length === 0 && !isLoading && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg border-muted-foreground/25">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Ad Types Found</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    Create your first ad type to start managing slots. Common types include Banner, Sidebar, and Popup.
                  </p>
                  <Button onClick={() => setIsOpen(true)}>
                    Create Ad Type
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
