import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { getCityConfig } from "@/lib/constants";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function TermsPage({ params }: PageProps) {
    const { city } = await params;
    const config = getCityConfig(city);

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <CardTitle className="text-4xl font-black font-headline text-primary tracking-tight">Terms of Service</CardTitle>
                        <p className="text-muted-foreground mt-2">Last Updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 pt-0 prose prose-slate max-w-none">
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold font-headline text-foreground">1. Introduction</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Welcome to GetFixam {config.name}. By using our platform, you agree to these terms. Our service connects customers in {config.name} with local skilled artisans.
                            </p>
                            
                            <h2 className="text-2xl font-bold font-headline text-foreground">2. User Responsibilities</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Customers are responsible for verifying the quality of work. While we vet artisans in {config.name}, we are a matching platform and not direct employers of the service providers.
                            </p>

                            <h2 className="text-2xl font-bold font-headline text-foreground">3. Service Provider Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Artisans listing their business in {config.name} must provide accurate information and maintain professional conduct. We reserve the right to suspend any account that fails to meet our community standards.
                            </p>

                            <h2 className="text-2xl font-bold font-headline text-foreground">4. Governing Law</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These terms are governed by the laws of the Republic of Ghana.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
