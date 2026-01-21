import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FaArrowLeft } from "react-icons/fa";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";

export default function Help() {
    return (
        <div className="min-h-screen flex flex-col">
            <LandingNav />
            <div className="max-w-4xl mx-auto space-y-6 flex-1 w-full p-6">
                <Link href="/">
                    <a className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                        <FaArrowLeft className="mr-2" /> Kembali ke Beranda
                    </a>
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-serif font-bold">Pusat Bantuan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Bagaimana cara memasang iklan?</AccordionTrigger>
                                <AccordionContent>
                                    Untuk memasang iklan, Anda perlu mendaftar akun terlebih dahulu. Setelah masuk, klik tombol "Buat Iklan Baru" di dashboard, pilih jenis iklan, durasi, dan slot yang tersedia, lalu lakukan pembayaran.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Berapa lama proses persetujuan iklan?</AccordionTrigger>
                                <AccordionContent>
                                    Tim kami akan meninjau materi iklan Anda dalam waktu maksimal 1x24 jam pada hari kerja.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Metode pembayaran apa yang tersedia?</AccordionTrigger>
                                <AccordionContent>
                                    Kami menerima pembayaran melalui transfer bank ke rekening resmi Jurnalistika ID. Detail pembayaran akan muncul di invoice setelah iklan disetujui.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger>Apakah saya bisa merevisi iklan yang sudah tayang?</AccordionTrigger>
                                <AccordionContent>
                                    Iklan yang sudah tayang tidak dapat diubah secara langsung. Silakan hubungi admin kami jika ada perubahan mendesak yang diperlukan.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">Masih butuh bantuan?</p>
                            <a href="https://wa.me/6281399205647" className="text-primary font-semibold hover:underline">
                                Hubungi Dukungan Pelanggan via WhatsApp
                            </a>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <LandingFooter />
        </div>
    );
}
