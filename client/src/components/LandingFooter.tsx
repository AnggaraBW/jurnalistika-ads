import { Link } from "wouter";

export default function LandingFooter() {
    return (
        <>
            {/* Footer */}
            <footer className="bg-card border-t border-border py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-sm text-muted-foreground">© 2024 Jurnalistika.id. Hak cipta dilindungi.</p>
                        <div className="flex space-x-6">
                            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Syarat & Ketentuan</Link>
                            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kebijakan Privasi</Link>
                            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Kontak</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}