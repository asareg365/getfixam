import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { getCityConfig } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ShieldAlert, Scale, Handshake } from "lucide-react";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function TermsPage({ params }: PageProps) {
    const { city } = await params;
    const config = getCityConfig(city);

    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: "By accessing or using GetFixam, you agree to comply with these Terms & Conditions. If you do not agree, please do not use the platform.",
            icon: FileText
        },
        {
            title: "2. Platform Nature",
            content: "GetFixam operates as a digital marketplace platform connecting clients with independent service providers. GetFixam does not directly provide repair or technical services, does not employ listed service professionals unless explicitly stated, does not guarantee service outcomes, and does not supervise physical work performed by providers. All service providers operate independently.",
            icon: Scale
        },
        {
            title: "3. User Eligibility",
            content: "Users must be at least 18 years old or have parental/guardian consent, provide accurate registration information, and use the platform lawfully and responsibly.",
            icon: ShieldAlert
        },
        {
            title: "4. Service Requests & Bookings",
            content: `Clients may browse service categories, contact GetFixam, request quotations, and book services through GetFixam. Service availability may vary by region and tenant location (e.g. ${config.name}).`,
            icon: Handshake
        },
        {
            title: "5. Payments",
            content: "GetFixam may introduce platform-related fees, booking charges, verification fees, commission structures, or service processing fees in the future. The applicable amounts and payment structure may vary by tenant or service category and will be clearly communicated before payment is required. Payments between clients and providers may occur directly or through approved platform payment systems where available.",
            icon: Handshake
        },
        {
            title: "6. Independent Contractors",
            content: "Service providers are independent contractors and are solely responsible for service quality, pricing agreements, professional conduct, compliance with applicable laws, and taxes. GetFixam may implement systems, reviews, and quality assurance measures to help ensure providers deliver the best possible experience. Nothing within the platform creates an employment, agency, or partnership relationship.",
            icon: Handshake
        },
        {
            title: "7. Reviews & Ratings",
            content: "Users may leave reviews based on genuine service experiences. GetFixam reserves the right to remove fraudulent or abusive reviews, suspend misleading accounts, and moderate inappropriate content.",
            icon: Handshake
        },
        {
            title: "8. Prohibited Activities",
            content: "Users may not provide false information, engage in fraud or scams, harass other users, upload harmful content, or attempt unauthorized access to platform systems.",
            icon: ShieldAlert
        },
        {
            title: "9. Limitation of Liability",
            content: "GetFixam shall not be liable for damages resulting from services provided by independent professionals, injuries, losses, or disputes between users, delays, or consequential damages. Users engage service providers at their own discretion and risk.",
            icon: Scale
        },
        {
            title: "10. Account Suspension",
            content: "GetFixam may suspend or terminate accounts that violate platform rules, engage in fraudulent behavior, or abuse the platform or other users.",
            icon: ShieldAlert
        },
        {
            title: "11. Regional Tenants",
            content: `Regional implementations such as GetFixam Berekum and GetFixam Accra (including this ${config.name} tenant) may operate independently under localized operational policies while remaining connected to the wider GetFixam ecosystem.`,
            icon: Handshake
        },
        {
            title: "12. Changes to Terms",
            content: "GetFixam may update these Terms & Conditions periodically. Continued use of the platform after updates constitutes acceptance of the revised terms.",
            icon: FileText
        }
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <CardTitle className="text-4xl font-black font-headline text-primary tracking-tight">Terms & Conditions</CardTitle>
                        <CardDescription className="text-lg mt-2 font-medium">
                            Operating under the GetFixam {config.name} Regional Tenant.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px] p-8 md:p-12 pt-0">
                            <div className="space-y-10">
                                {sections.map((section, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <h2 className="text-xl font-bold font-headline flex items-center gap-3 text-foreground">
                                            <section.icon className="h-5 w-5 text-primary shrink-0" />
                                            {section.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed font-medium">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-8 border-t">
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                        Last Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
