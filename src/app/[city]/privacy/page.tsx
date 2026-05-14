import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { getCityConfig } from "@/lib/constants";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function PrivacyPage({ params }: PageProps) {
    const { city } = await params;
    const config = getCityConfig(city);

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <CardTitle className="text-4xl font-black font-headline text-primary tracking-tight">Privacy Policy</CardTitle>
                        <p className="text-muted-foreground mt-2">How we protect your data in {config.name}</p>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 pt-0 prose prose-slate max-w-none">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold font-headline text-foreground">1. Data Collection</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We collect your name, phone number, and location in {config.name} to facilitate matching with local artisans.
                            </p>
                            
                            <h2 className="text-2xl font-bold font-headline text-foreground">2. Use of Information</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Your information is only shared with the specific artisan you choose to contact. We do not sell your personal data to third parties.
                            </p>

                            <h2 className="text-2xl font-bold font-headline text-foreground">3. Security</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use industry-standard encryption to protect your account and communication logs.
                            </p>

                            <h2 className="text-2xl font-bold font-headline text-foreground">4. Cookies</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                We use cookies to maintain your login session and remember your city preference (e.g., {config.name}).
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
