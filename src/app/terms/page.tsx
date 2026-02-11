import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <CardTitle className="text-4xl font-black font-headline text-primary tracking-tight">Terms of Service</CardTitle>
                        <p className="text-muted-foreground mt-2 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 pt-0 space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">1. Acceptance of Terms</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                By accessing or using the GetFixam platform (“the App”), you agree to these Terms of Service. If you do not agree, do not use the App.
                            </p>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">2. Use of the App</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Users may browse, book, and review services provided by registered artisans.</li>
                                <li>Artisans are required to provide accurate and up-to-date information about their services.</li>
                                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">3. Payments and Fees</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Payments are made directly to the artisan or via approved payment methods.</li>
                                <li>Any fees or commissions charged by GetFixam will be clearly communicated.</li>
                                <li>Refunds are subject to individual artisan policies and applicable law.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">4. User Conduct</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Users and artisans must act in good faith and refrain from fraudulent or harmful activity.</li>
                                <li>Harassment, abuse, or posting offensive content is strictly prohibited.</li>
                                <li>Violation of these terms may result in suspension or termination of your account.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">5. Limitation of Liability</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>GetFixam is a platform connecting users and artisans and does not provide the services itself.</li>
                                <li>GetFixam is not responsible for service quality, timing, or safety.</li>
                                <li>Users agree that use of the App is at their own risk.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">6. Termination</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>GetFixam may suspend or terminate accounts for violations of these terms.</li>
                                <li>Users may stop using the App at any time.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">7. Modifications</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Terms may be updated; users will be notified of significant changes.</li>
                                <li>Continued use after updates constitutes acceptance of the revised terms.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">8. Governing Law</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                These Terms are governed by the laws of the Republic of Ghana.
                            </p>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
