import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Users, Globe, CheckCircle2, Wrench, Smartphone } from "lucide-react";
import Link from "next/link";
import { getCityConfig } from "@/lib/constants";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function AboutPage({ params }: PageProps) {
    const { city } = await params;
    const config = getCityConfig(city);
    const cityPath = `/${city}`;

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12 text-center">
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-6">
                            <Globe className="h-4 w-4 mr-2" />
                            Ghana's Trusted Service Marketplace
                        </div>
                        <CardTitle className="text-5xl font-black font-headline text-primary tracking-tight">About GetFixam {config.name}</CardTitle>
                        <p className="text-xl text-muted-foreground mt-4 font-medium max-w-2xl mx-auto">Connecting clients with trusted local service professionals across Ghana.</p>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 pt-0 space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold font-headline text-foreground">The Platform</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Starting in Berekum and expanding into Accra, GetFixam helps people quickly find skilled workers such as plumbers, electricians, carpenters, cleaners, AC technicians, painters, appliance repairers, CCTV installers, mechanics, and other home or business service providers.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Our mission is to make local services more accessible, trustworthy, and organized by helping customers connect with verified professionals through one easy-to-use platform.
                            </p>
                        </section>

                        <Separator />

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold font-headline flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <Users className="h-5 w-5 text-primary" />
                                    </div>
                                    For Users
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        "Search for local service providers",
                                        "Request and book services",
                                        "Communicate with professionals",
                                        "Rate and review completed work",
                                        "Access location-based service listings",
                                        "Secure service-related payments"
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-muted-foreground font-medium">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold font-headline flex items-center gap-3">
                                    <div className="bg-secondary/10 p-2 rounded-xl">
                                        <Wrench className="h-5 w-5 text-secondary" />
                                    </div>
                                    For Professionals
                                </h3>
                                <ul className="space-y-4">
                                    {[
                                        "Create professional business profiles",
                                        "Showcase skills and experience",
                                        "Receive real-time job requests",
                                        "Build reputation through reviews",
                                        "Expand visibility within {config.name}",
                                        "Manage your local community footprint"
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-muted-foreground font-medium">
                                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            {item.replace('{config.name}', config.name)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <Separator />

                        <section className="bg-muted/30 p-8 md:p-12 rounded-[40px] space-y-6">
                            <div className="flex items-center gap-4 mb-2">
                                <ShieldCheck className="h-8 w-8 text-primary" />
                                <h2 className="text-2xl font-bold font-headline">Independent Regional Operations</h2>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                GetFixam currently operates through independent regional tenants including <b>GetFixam Berekum</b> and <b>GetFixam Accra</b>. Each tenant operates independently while remaining part of the broader GetFixam platform ecosystem.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                GetFixam is a technology platform and does not directly provide repair, maintenance, or trade services. Services are provided by independent service professionals using the platform.
                            </p>
                        </section>

                        <div className="text-center pt-8">
                            <h2 className="text-2xl font-bold font-headline mb-6">Are you a skilled artisan in {config.name}?</h2>
                            <Link href={`${cityPath}/add-provider`} className="inline-flex items-center justify-center bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
                                List Your Business Today
                                <Smartphone className="ml-3 h-6 w-6" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
