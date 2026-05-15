import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { getCityConfig } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Eye, ShieldCheck, Database, Info, RefreshCw, Smartphone, Globe, ShieldAlert } from "lucide-react";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function PrivacyPage({ params }: PageProps) {
    const { city } = await params;
    const config = getCityConfig(city);

    const sections = [
        {
            title: "1. Introduction",
            content: `GetFixam ${config.name} values user privacy and is committed to protecting personal information collected through our digital marketplace platform. We believe in transparency and security as the foundation of local service commerce.`,
            icon: Info
        },
        {
            title: "2. Information We Collect",
            content: "We collect information required to facilitate service matching, including names, phone numbers, email addresses, and location data. Service providers submit business details, profile images, and verification documents to build trust on the platform.",
            icon: Database
        },
        {
            title: "3. How We Use Information",
            content: "Your data is used to operate and improve the platform, match you with relevant service providers, facilitate WhatsApp or phone communication, provide customer support, and send platform-related notifications.",
            icon: Eye
        },
        {
            title: "4. Payments Security",
            content: "Financial information for service payments is processed securely through licensed third-party payment providers like Paystack. GetFixam does not store sensitive banking credentials or credit card numbers directly on our servers.",
            icon: Lock
        },
        {
            title: "5. Information Sharing",
            content: "We share limited details between clients and artisans to facilitate services. We may share data with third-party partners who provide technology or support services. We do not sell your personal data to marketing third parties.",
            icon: Globe
        },
        {
            title: "6. Data Security",
            content: "We implement robust technical and organizational safeguards (including encryption and secure Firestore rules) to protect your information. However, users should acknowledge that no digital system is completely immune to risks.",
            icon: ShieldCheck
        },
        {
            title: "7. User Rights",
            content: "You have the right to access your personal data, request corrections to inaccurate information, and request account deletion where legally permissible. We provide tools within the profile settings to manage your data preferences.",
            icon: Smartphone
        },
        {
            title: "8. Cookies & Tracking",
            content: "We use cookies and similar technologies to improve site performance, remember your preferences, and analyze platform usage to provide a better service experience for both clients and artisans.",
            icon: Database
        },
        {
            title: "9. Regional Operations",
            content: `As a tenant of the GetFixam platform, ${config.name} may operate localized data policies while remaining compliant with the broader platform standards. Data may be stored and processed centrally to ensure platform reliability.`,
            icon: RefreshCw
        },
        {
            title: "10. Policy Updates",
            content: "This Privacy Policy may be updated to reflect changes in our practices or legal obligations. We encourage users to review this page periodically to stay informed about how we protect their data.",
            icon: ShieldAlert
        },
        {
            title: "11. Contact Us",
            content: "For any privacy-related inquiries or to exercise your data rights, please contact the GetFixam support team through our official contact channels in your region.",
            icon: Info
        }
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <div className="bg-primary/10 w-fit p-3 rounded-2xl mb-4">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tight leading-tight">Privacy Policy</CardTitle>
                        <CardDescription className="text-lg mt-3 font-medium">
                            How we protect your data at GetFixam {config.name}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 border-t">
                        <ScrollArea className="h-[650px] p-8 md:p-12">
                            <div className="space-y-12">
                                {sections.map((section, idx) => (
                                    <div key={idx} className="space-y-4 group">
                                        <h2 className="text-xl font-black font-headline flex items-center gap-3 text-foreground group-hover:text-primary transition-colors">
                                            <section.icon className="h-5 w-5 text-primary shrink-0" />
                                            {section.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed font-medium pl-8 border-l-2 border-primary/5 group-hover:border-primary/20 transition-all">
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-10 border-t mt-8">
                                    <div className="bg-muted/50 p-6 rounded-2xl flex items-center gap-4 border border-dashed border-muted-foreground/20">
                                        <Lock className="h-6 w-6 text-muted-foreground/60" />
                                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                                            Privacy Guard Active • Secure {config.name} Regional Tenant
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
