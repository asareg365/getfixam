import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { getCityConfig } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Eye, ShieldCheck, Database, Info, RefreshCw } from "lucide-react";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function PrivacyPage({ params }: PageProps) {
    const { city } = await params;
    const config = getCityConfig(city);

    const sections = [
        {
            title: "1. Introduction",
            content: "GetFixam values user privacy and is committed to protecting personal information collected through the platform.",
            icon: Info
        },
        {
            title: "2. Information We Collect",
            content: "We may collect your name, phone number, email address, location information, profile details, service history, and messages exchanged on the platform. Service providers may also submit business details, verification documents, and payment information where applicable.",
            icon: Database
        },
        {
            title: "3. How We Use Information",
            content: "We use collected information to operate and improve the platform, match users with service providers, facilitate communication, provide customer support, improve security, and send service notifications.",
            icon: Eye
        },
        {
            title: "4. Payments",
            content: "Where payment systems are introduced, financial information may be processed securely through third-party payment providers. GetFixam does not store sensitive banking credentials directly unless explicitly stated.",
            icon: Lock
        },
        {
            title: "5. Information Sharing",
            content: "We may share limited information between clients and service providers to facilitate services, with third-party service providers supporting operations, or when legally required. We do not sell personal information to third parties.",
            icon: ShieldCheck
        },
        {
            title: "6. Data Security",
            content: "We implement reasonable technical and organizational safeguards to protect user information. However, no digital system can guarantee absolute security.",
            icon: Lock
        },
        {
            title: "7. User Rights",
            content: "Users may request to access their information, correct inaccurate data, delete accounts where legally permissible, or withdraw certain permissions.",
            icon: ShieldCheck
        },
        {
            title: "8. Cookies & Analytics",
            content: "GetFixam may use cookies, analytics tools, and similar technologies to improve platform performance and user experience.",
            icon: Database
        },
        {
            title: "9. Regional Operations",
            content: `Different tenant locations, including Berekum and Accra (such as this ${config.name} tenant), may operate localized services while remaining under the broader GetFixam platform structure.`,
            icon: RefreshCw
        },
        {
            title: "10. Policy Updates",
            content: "This Privacy Policy may be updated periodically. Continued use of the platform indicates acceptance of updated policies.",
            icon: RefreshCw
        },
        {
            title: "11. Contact",
            content: "For privacy or legal inquiries, users may contact GetFixam through the official platform contact channels.",
            icon: Info
        }
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
                <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="h-2 bg-primary w-full" />
                    <CardHeader className="p-8 md:p-12">
                        <CardTitle className="text-4xl font-black font-headline text-primary tracking-tight">Privacy Policy</CardTitle>
                        <CardDescription className="text-lg mt-2 font-medium">
                            How we protect your data at GetFixam {config.name}.
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
                                        Privacy Protection Active • {config.name} Regional Tenant
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
