import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FaArrowLeft } from "react-icons/fa";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";

export default function Privacy() {
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
                        <CardTitle className="text-3xl font-serif font-bold">Kebijakan Privasi</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none space-y-4">
                        <p className="text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>

                        <h3>1. Pengumpulan Data</h3>
                        <p>
                            Kami mengumpulkan informasi yang Anda berikan saat mendaftar, seperti nama, email, nama perusahaan,
                            dan detail kontak lainnya untuk keperluan administrasi layanan iklan.
                        </p>

                        <h3>2. Penggunaan Data</h3>
                        <p>
                            Data yang dikumpulkan digunakan untuk memproses pesanan iklan, komunikasi terkait status iklan,
                            dan pengiriman tagihan/invoice.
                        </p>

                        <h3>3. Perlindungan Data</h3>
                        <p>
                            Kami berkomitmen untuk melindungi data pribadi Anda dan tidak akan menjual atau membagikan data
                            kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.
                        </p>

                        <h3>4. Cookies</h3>
                        <p>
                            Platform ini menggunakan cookies untuk meningkatkan pengalaman pengguna dan menyimpan sesi login Anda.
                        </p>
                    </CardContent>
                </Card>
            </div>
            <LandingFooter />
        </div>
    );
}
