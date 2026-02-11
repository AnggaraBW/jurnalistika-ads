import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, ArrowLeft, Trash2 } from "lucide-react";
import AdminNav from "@/components/AdminNav";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertAdSlotSchema, type AdSlot, type InsertAdSlot } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "wouter";

export default function AdminAdSlotsList() {
    const params = useParams();

    const categoryId = params?.category;

    const [isOpen, setIsOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch only slots for this category if possible, or filter client side.
    // API currently returns all.
    const { data: allSlots, isLoading } = useQuery<AdSlot[]>({
        queryKey: ["/api/ad-slots"],
    });

    const slots = allSlots?.filter(s => s.adType === categoryId);

    const form = useForm<InsertAdSlot>({
        resolver: zodResolver(insertAdSlotSchema),
        defaultValues: {
            name: "",
            location: "",
            pricePerDay: "0",
            pricePerView: "0",
            adType: categoryId as any, // Pre-select category
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertAdSlot) => {
            const formattedData = {
                ...data,
                pricePerDay: String(data.pricePerDay),
                pricePerView: String(data.pricePerView),
            };

            if (selectedSlot) {
                const res = await apiRequest("PATCH", `/api/ad-slots/${selectedSlot.id}`, formattedData);
                return res.json();
            } else {
                const res = await apiRequest("POST", "/api/ad-slots", formattedData);
                return res.json();
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ad-slots"] });
            setIsOpen(false);
            form.reset();
            setSelectedSlot(null);
            toast({
                title: "Berhasil",
                description: selectedSlot ? "Slot iklan berhasil diperbarui" : "Slot iklan berhasil ditambahkan",
            });
        },
        onError: (error: Error) => {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: error.message,
            });
        },
    });

    const onSubmit = (data: InsertAdSlot) => {
        mutation.mutate(data);
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/ad-slots/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/ad-slots"] });
            toast({
                title: "Berhasil",
                description: "Slot iklan berhasil dihapus",
            });
        },
        onError: (error: Error) => {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: error.message,
            });
        },
    });

    const handleAdd = () => {
        setSelectedSlot(null);
        form.reset({
            name: "",
            location: "",
            pricePerDay: "0",
            pricePerView: "0",
            adType: categoryId as any,
        });
        setIsOpen(true);
    }

    const handleEdit = (slot: AdSlot) => {
        console.log('being clicked');
        setSelectedSlot(slot);
        form.reset({
            name: slot.name,
            location: slot.location,
            pricePerDay: String(slot.pricePerDay),
            pricePerView: String(slot.pricePerView),
            adType: slot.adType,
            position: slot.position,
        });
        setIsOpen(true);
    }

    const formatCurrency = (amount: string | number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(Number(amount));
    };

    const categoryLabel = categoryId ? categoryId.charAt(0).toUpperCase() + categoryId.slice(1) : "All";

    return (
        <div className="min-h-screen bg-background">
            <AdminNav />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/categories">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-foreground mb-2">
                                {categoryLabel} Slots
                            </h2>
                            <p className="text-muted-foreground">
                                Manage ad slots for {categoryLabel} category
                            </p>
                        </div>
                    </div>

                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Slot Baru
                    </Button>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{selectedSlot ? `Edit Slot ${categoryLabel}` : `Tambah Slot ${categoryLabel} Baru`}</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            {/* {Object.keys(form.formState.errors).length > 0 && (
                                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4 border border-destructive/20">
                                    <ul className="list-disc list-inside space-y-1">
                                        {Object.entries(form.formState.errors).map(([key, error]) => (
                                            <li key={key}>
                                                <span className="font-medium capitalize">{key}:</span> {error?.message?.toString()}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )} */}
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Slot</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: Banner Utama Homepage" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Hidden adType field since it's pre-selected for this page */}
                                <FormField
                                    control={form.control}
                                    name="adType"
                                    render={({ field }) => (
                                        <input type="hidden" {...field} value={categoryId} />
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Posisi</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih posisi" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="top">Atas</SelectItem>
                                                    <SelectItem value="bottom">Bawah</SelectItem>
                                                    <SelectItem value="right">Kanan</SelectItem>
                                                    <SelectItem value="middle">Tengah</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lokasi (Page/Section)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: Homepage, Artikel Detail" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="pricePerDay"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Harga per Hari (IDR)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="pricePerView"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Harga per View (IDR)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        {...field}
                                                        onChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {selectedSlot ? "Update Slot" : "Simpan Slot"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Slot {categoryLabel}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                <p className="mt-2 text-muted-foreground">Memuat data slot...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Posisi</TableHead>
                                        <TableHead>Lokasi</TableHead>
                                        <TableHead>Harga/Hari</TableHead>
                                        <TableHead>Harga/View</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {slots?.map((slot) => (
                                        <TableRow
                                            key={slot.id}
                                            onClick={() => handleEdit(slot)}
                                            className="cursor-pointer"
                                        >
                                            <TableCell className="font-medium">{slot.name}</TableCell>
                                            <TableCell className="capitalize">{slot.position}</TableCell>
                                            <TableCell>{slot.location}</TableCell>
                                            <TableCell>{formatCurrency(slot.pricePerDay)}</TableCell>
                                            <TableCell>{formatCurrency(slot.pricePerView)}</TableCell>
                                            <TableCell>
                                                <Badge variant={slot.isAvailable ? "default" : "secondary"}>
                                                    {slot.isAvailable ? "Tersedia" : "Tidak Tersedia"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus Slot Iklan?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tindakan ini tidak dapat dibatalkan. Slot iklan ini akan dihapus permanen.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => deleteMutation.mutate(slot.id)}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {slots?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Belum ada slot iklan untuk kategori ini.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
