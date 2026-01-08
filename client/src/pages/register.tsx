import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaNewspaper, FaArrowLeft } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
    firstName: z.string().min(2, "Nama depan minimal 2 karakter"),
    lastName: z.string().min(2, "Nama belakang minimal 2 karakter"),
    companyName: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
    email: z.string().email("Email tidak valid"),
    // password: z.string().min(8, "Password minimal 8 karakter"),
    // confirmPassword: z.string()
})
// .refine((data) => data.password === data.confirmPassword, {
//     message: "Password tidak cocok",
//     path: ["confirmPassword"],
// });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            companyName: "",
            email: "",
            // password: "",
            // confirmPassword: "",
        },
    });

    async function onSubmit(data: RegisterFormValues) {
        setIsLoading(true);
        try {
            // const response = await fetch("/api/register", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(data),
            // });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.message || "Gagal mendaftar");
            // }

            // toast({
            //     title: "Pendaftaran Berhasil",
            //     description: "Silakan login dengan akun yang baru Anda buat.",
            // });

            setLocation("/login"); // Or wherever login page is, actually landing has the login button?
            // Since login is on landing, maybe redirect to landing?
            // But landing has the "login with google" button? 
            // I probably need to add a "Login with Email" form on Landing or a separate Login/Landing page.
            // For now, redirect to landing.
            setLocation("/");

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Gagal Mendaftar",
                description: error instanceof Error ? error.message : "Terjadi kesalahan",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="bg-card border-b border-border py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                        <FaArrowLeft />
                        <span>Kembali</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <FaNewspaper className="text-primary-foreground text-lg" />
                        </div>
                        <span className="font-serif font-bold text-lg">Jurnalistika Ads</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-serif font-bold text-center">Buat Akun Baru</CardTitle>
                        <CardDescription className="text-center">
                            Lengkapi data berikut untuk mendaftar sebagai pemasang iklan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="firstName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Depan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lastName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Belakang</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="companyName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Perusahaan</FormLabel>
                                            <FormControl>
                                                <Input placeholder="PT Jurnalistika Media" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john@company.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Konfirmasi Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="********" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                /> */}

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Memproses..." : "Daftar Sekarang"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter>
                        <div className="text-center w-full text-sm text-muted-foreground">
                            Sudah punya akun?{" "}
                            <Link href="/" className="text-primary hover:underline font-medium">
                                Masuk disini
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
