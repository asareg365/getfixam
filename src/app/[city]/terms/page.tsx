import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { getCityConfig } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ShieldAlert, Scale, Handshake, CreditCard, UserCheck, MessageSquare, AlertCircle } from "lucide-react";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function TermsPage({ params }: PageProps) {
    const { city } = await params;
    const config = getCityConfig(city);

    const sections = [
        {
            title: "1. Acceptance of Terms",
            content: "By accessing or using GetFixam, you agree to comply with these Terms & Conditions. If you do not agree, please do not use the platform. Continued use of the platform indicates your ongoing acceptance of these terms.",
            icon: FileText
        },
        {
            title: "2. Platform Nature",
            content: `GetFixam operates as a digital marketplace platform connecting clients with independent service providers. GetFixam ${config.name} does not directly provide repair or technical services, does not employ listed service professionals, does not guarantee service outcomes, and does not supervise physical work performed by providers. All artisans operate as independent entities.`,
            icon: Scale
        },
        {
            title: "3. User Eligibility",
            content: "Users must be at least 18 years old or have parental/guardian consent to use our services. You agree to provide accurate registration information and use the platform lawfully and responsibly at all times.",
            icon: UserCheck
        },
        {
            title: "4. Service Requests & Bookings",
            content: "Clients may browse service categories, contact GetFixam, request quotations, and book services through the platform. Please note that service availability and response times may vary by region and individual artisan schedules.",
            icon: Handshake
        },
        {
            title: "5. Payments & Escrow",
            content: "GetFixam may introduce platform-related fees, booking charges, or commission structures. The applicable amounts will be clearly communicated before payment is required. We may offer secure payment processing where funds are held until job completion is verified by the client.",
            icon: CreditCard
        },
        {
            title: "6. Independent Contractors",
            content: "Service providers are independent contractors and are solely responsible for service quality, pricing agreements, professional conduct, compliance with laws, and their own business taxes. GetFixam is not a party to the direct service agreement between the artisan and the client.",
            icon: UserCheck
        },
        {
            title: "7. Reviews & Ratings",
            content: "Users may leave reviews based on genuine service experiences. GetFixam reserves the right to remove fraudulent or abusive reviews and moderate content that violates our community standards to maintain platform integrity.",
            icon: MessageSquare
        },
        {
            title: "8. Prohibited Activities",
            content: "Users may not provide false information, engage in fraud or scams, harass other users, upload harmful content, or attempt to gain unauthorized access to our administrative systems or database.",
            icon: ShieldAlert
        },
        {
            title: "9. Limitation of Liability",
            content: "GetFixam shall not be liable for damages resulting from services provided by independent professionals, injuries, losses, or disputes between users. Users engage service providers at their own discretion and personal risk.",
            icon: AlertCircle
        },
        {
            title: "10. Account Suspension",
            content: "GetFixam reserves the right to suspend or terminate accounts that violate platform rules, engage in fraudulent behavior, or cause harm to the platform's reputation and its community members.",
            icon: Scale
        },
        {
            title: "11. Regional Tenants",
            content: `Regional implementations such as GetFixam ${config.name} may operate independently under localized operational policies while remaining connected to the wider GetFixam ecosystem for technology and support.`,
            icon: Handshake
        },
        {
            title: "12. Changes to Terms",
            content: "GetFixam may update these Terms & Conditions periodically. We will notify users of significant changes, and continued use of the platform after such updates constitutes acceptance of the revised terms.",
            icon: FileText
        }
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <div className="bg-primary/10 w-fit p-3 rounded-2xl mb-4">
                            <Scale className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tight">Terms & Conditions</CardTitle>
                        <CardDescription className="text-lg mt-3 font-medium">
                            Operating under the GetFixam {config.name} Regional Tenant.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 border-t">
                        <ScrollArea className="h-[650px] p-8 md:p-12">
                            <div className="space-y-12">
                                {sections.map((section, idx) => (
                                    <div key={idx} className="space-y-4 group">
                                        <h2 className="text-xl font-black font-headline flex items-center gap-3 text-foreground transition-colors group-hover:text-primary">
                                            <section.icon className="h-5 w-5 text-primary shrink-0" />
                                            {section.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed font-medium pl-8 border-l-2 border-primary/5 group-hover:border-primary/20 transition-all">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-10 border-t mt-8">
                                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest bg-muted/50 w-fit px-4 py-2 rounded-lg">
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
