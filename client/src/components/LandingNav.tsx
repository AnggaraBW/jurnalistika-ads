import { FaNewspaper, FaQuestionCircle } from "react-icons/fa";
import { Link } from "wouter";

export default function LandingNav() {
    return (
        <>
            {/* Header */}
            <header className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                <FaNewspaper className="text-primary-foreground text-xl" />
                            </div>
                            <div>
                                <h1 className="text-xl font-serif font-bold text-foreground">Jurnalistika Ads</h1>
                                <p className="text-xs text-muted-foreground">Platform Periklanan Jurnalistika.id</p>
                            </div>
                        </div>
                        <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <FaQuestionCircle className="inline mr-1" /> Bantuan
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
}