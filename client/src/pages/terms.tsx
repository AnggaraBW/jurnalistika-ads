import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FaArrowLeft } from "react-icons/fa";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";

export default function Terms() {
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
                        <CardTitle className="text-3xl font-serif font-bold">Syarat dan Ketentuan</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                        <p className="text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

                        <h3>1. Pendahuluan</h3>
                        <p>
                            Selamat datang di Platform Iklan Jurnalistika.id. Dengan mengakses dan menggunakan layanan ini,
                            Anda menyetujui untuk terikat oleh syarat dan ketentuan berikut.
                        </p>

                        <h3>2. Layanan Iklan</h3>
                        <p>
                            Platform ini menyediakan layanan pemasangan iklan digital di jaringan media Jurnalistika.id.
                            Pengguna dapat memilih slot, durasi, dan jenis iklan sesuai ketersediaan.
                        </p>

                        <h3>3. Pembayaran</h3>
                        <p>
                            Pembayaran harus dilakukan penuh sebelum iklan ditayangkan. Harga yang tertera belum termasuk pajak PPN 11%
                            kecuali disebutkan lain.
                        </p>

                        <h3>4. Konten Iklan</h3>
                        <p>
                            Materi iklan tidak boleh mengandung unsur SARA, pornografi, judi, atau materi ilegal lainnya
                            sesuai hukum Republik Indonesia. Jurnalistika.id berhak menolak materi iklan yang tidak sesuai.
                        </p>

                        <h3>5. Pembatalan dan Pengembalian Dana</h3>
                        <p>
                            Pembatalan sepihak oleh pengiklan setelah pembayaran tidak dapat dikembalikan.
                            Jika penolakan dilakukan oleh Jurnalistika.id karena alasan teknis, dana akan dikembalikan sepenuhnya.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <LandingFooter />
        </div>
    );
}
