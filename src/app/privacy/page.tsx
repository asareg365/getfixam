import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPage() {
    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-secondary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <CardTitle className="text-4xl font-black font-headline text-primary tracking-tight">Privacy Policy</CardTitle>
                        <p className="text-muted-foreground mt-2 font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent className="p-8 md:p-12 pt-0 space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">1. Information Collected</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li><strong>Personal Information:</strong> Name, phone number, email, location.</li>
                                <li><strong>Service Information:</strong> Bookings, payments, artisan interactions.</li>
                                <li><strong>Device Information:</strong> IP address, browser type, operating system.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">2. Use of Information</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>To provide, maintain, and improve services.</li>
                                <li>To communicate booking confirmations, updates, and marketing (if consented).</li>
                                <li>For analytics, research, and operational purposes.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">3. Information Sharing</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Information is shared with artisans to deliver services.</li>
                                <li>Data is not sold to third parties.</li>
                                <li>Disclosure may occur to comply with Ghanaian law or legal processes.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">4. Security</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Reasonable administrative, technical, and physical measures protect your data.</li>
                                <li>Users acknowledge that no system is completely secure.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">5. User Rights</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Access and correct personal information.</li>
                                <li>Request deletion of personal data where applicable under Ghanaian law.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">6. Cookies and Analytics</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Cookies may be used to improve user experience.</li>
                                <li>Analytics tools (e.g., Google Analytics) may collect anonymized usage data.</li>
                            </ul>
                        </section>

                        <Separator />

                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline text-foreground">7. Updates to Policy</h2>
                            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                <li>Updates will be posted on the App/website.</li>
                                <li>Continued use after updates constitutes acceptance.</li>
                            </ul>
                        </section>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
