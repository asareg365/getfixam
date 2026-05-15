import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Users, Globe, CheckCircle2, Wrench, Smartphone, Search, MessageSquare, Star } from "lucide-react";
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
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[40px] overflow-hidden bg-white">
                    <div className="h-3 bg-primary w-full" />
                    <CardHeader className="p-10 md:p-16 text-center">
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-primary mb-8">
                            <Globe className="h-4 w-4 mr-2" />
                            Ghana's Premier Artisan Marketplace
                        </div>
                        <CardTitle className="text-5xl md:text-6xl font-black font-headline text-primary tracking-tight leading-tight">
                            About GetFixam {config.name}
                        </CardTitle>
                        <p className="text-xl text-muted-foreground mt-6 font-medium max-w-2xl mx-auto leading-relaxed">
                            Connecting clients with trusted local service professionals across Ghana, powered by technology and local expertise.
                        </p>
                    </CardHeader>
                    <CardContent className="p-10 md:p-16 pt-0 space-y-16">
                        <section className="space-y-6">
                            <h2 className="text-3xl font-black font-headline text-foreground flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-primary rounded-full" />
                                Our Mission
                            </h2>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                Starting in Berekum and expanding into Accra, GetFixam helps people quickly find skilled workers such as plumbers, electricians, carpenters, cleaners, AC technicians, painters, appliance repairers, CCTV installers, mechanics, and other home or business service providers.
                            </p>
                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                Our mission is to make local services more accessible, trustworthy, and organized by helping customers connect with verified professionals through one easy-to-use platform.
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-8 p-8 rounded-[32px] bg-primary/5 border border-primary/10">
                                <h3 className="text-2xl font-black font-headline flex items-center gap-3 text-primary">
                                    <Users className="h-6 w-6" />
                                    For Clients
                                </h3>
                                <ul className="space-y-5">
                                    {[
                                        { text: "Search for local service providers", icon: Search },
                                        { text: "Request and book services easily", icon: Smartphone },
                                        { text: "Communicate directly with pros", icon: MessageSquare },
                                        { text: "Rate and review completed work", icon: Star },
                                        { text: "Access neighborhood listings", icon: Globe },
                                        { text: "Secure service-related payments", icon: ShieldCheck }
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-foreground/80 font-bold text-sm">
                                            <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-8 p-8 rounded-[32px] bg-secondary/5 border border-secondary/10">
                                <h3 className="text-2xl font-black font-headline flex items-center gap-3 text-secondary">
                                    <Wrench className="h-6 w-6" />
                                    For Professionals
                                </h3>
                                <ul className="space-y-5">
                                    {[
                                        { text: "Create professional business profiles", icon: CheckCircle2 },
                                        { text: "Showcase skills and experience", icon: CheckCircle2 },
                                        { text: "Receive real-time job requests", icon: CheckCircle2 },
                                        { text: "Build reputation through reviews", icon: CheckCircle2 },
                                        { text: `Expand visibility in ${config.name}`, icon: CheckCircle2 },
                                        { text: "Manage local neighborhood reach", icon: CheckCircle2 }
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-foreground/80 font-bold text-sm">
                                            <item.icon className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <Separator className="opacity-50" />

                        <section className="bg-muted/30 p-10 md:p-12 rounded-[40px] border border-muted-foreground/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-white p-3 rounded-2xl shadow-sm">
                                    <ShieldCheck className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black font-headline tracking-tight uppercase">Independent Regional Operations</h2>
                            </div>
                            <div className="space-y-4 text-muted-foreground leading-relaxed font-medium">
                                <p>
                                    GetFixam currently operates through independent regional tenants including <b>GetFixam Berekum</b> and <b>GetFixam Accra</b>. Each tenant operates independently while remaining part of the broader GetFixam platform ecosystem.
                                </p>
                                <p>
                                    GetFixam is a technology platform and does not directly provide repair, maintenance, or trade services. All services are provided by independent service professionals using the platform tools.
                                </p>
                            </div>
                        </section>

                        <div className="text-center pt-8">
                            <h2 className="text-3xl font-black font-headline mb-8 text-primary">Grow your business with us!</h2>
                            <Link href={`${cityPath}/add-provider`} className="inline-flex items-center justify-center bg-primary text-white px-12 py-5 rounded-2xl font-black text-lg hover:shadow-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20">
                                List Your Business in {config.name}
                                <Smartphone className="ml-3 h-6 w-6" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
