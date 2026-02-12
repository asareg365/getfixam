import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Users, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12 text-center">
                        <CardTitle className="text-5xl font-black font-headline text-primary tracking-tight">About GetFixam</CardTitle>
                        <p className="text-xl text-muted-foreground mt-4 font-medium">Connecting Quality Local Skills with the Community.</p>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 pt-0 space-y-12">
                        <section className="space-y-6">
                            <h2 className="text-3xl font-bold font-headline text-foreground">Our Mission</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                GetFixam Ghana is a platform dedicated to bridging the gap between skilled local artisans and customers in Berekum and the surrounding neighborhoods. We empower local professionals to grow their businesses while providing residents with a safe, reliable, and efficient way to find the help they need.
                            </p>
                        </section>

                        <Separator />

                        <section className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold font-headline">Safety & Trust</h3>
                                <p className="text-muted-foreground">
                                    We manually verify artisans on our platform to ensure they are who they say they are, providing peace of mind for every job.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-secondary/10 w-12 h-12 rounded-xl flex items-center justify-center text-secondary">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold font-headline">Community First</h3>
                                <p className="text-muted-foreground">
                                    By focusing on Berekum, we support the local economy and ensure that neighbors are helping neighbors.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold font-headline">Hyper-Local</h3>
                                <p className="text-muted-foreground">
                                    Find help right in your zone—whether it's Biadan, Kato, or Berekum Central—reducing wait times and travel costs.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold font-headline">Quality Service</h3>
                                <p className="text-muted-foreground">
                                    Our review system allows the community to reward the best performers and ensures high standards are maintained.
                                </p>
                            </div>
                        </section>

                        <Separator />

                        <section className="bg-muted/30 p-8 rounded-[24px] text-center space-y-6">
                            <h2 className="text-2xl font-bold font-headline">Are you an artisan?</h2>
                            <p className="text-muted-foreground">
                                Join our growing directory of professionals and get discovered by thousands of customers in your area. Listing your business is free and simple.
                            </p>
                            <Link href="/add-provider" className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all">
                                List Your Business Today
                            </Link>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
