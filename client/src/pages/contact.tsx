import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FaArrowLeft, FaWhatsapp, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import LandingNav from "@/components/LandingNav";
import LandingFooter from "@/components/LandingFooter";

export default function Contact() {
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
                        <CardTitle className="text-3xl font-serif font-bold">Hubungi Kami</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <p className="text-lg text-muted-foreground">
                            Tim support kami siap membantu Anda dengan kebutuhan periklanan Anda.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-xl">Kontak Langsung</h3>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <FaWhatsapp className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-medium">WhatsApp</p>
                                        <a href="https://wa.me/6281399205647" target="_blank" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            +62 813-9920-5647
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                        <FaEnvelope className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <a href="mailto:iklan@jurnalistika.id" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                            iklan@jurnalistika.id
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-xl">Alamat Kantor</h3>
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary mt-1">
                                        <FaMapMarkerAlt className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Jurnalistika ID</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            Jl. Contoh Alamat No. 123,<br />
                                            Jakarta Selatan, DKI Jakarta<br />
                                            Indonesia 12345
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t">
                            <Button className="w-full md:w-auto" asChild>
                                <a href="https://wa.me/6281399205647" target="_blank" rel="noopener noreferrer">
                                    Chat Tim Sales Kami via WhatsApp
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <LandingFooter />
        </div>
    );
}
