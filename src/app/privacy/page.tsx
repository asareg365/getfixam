import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert">
                    <p>Placeholder for Privacy Policy. Please replace this with your actual policy.</p>
                    <h2>1. Information We Collect</h2>
                    <p>We collect information that you provide to us directly, such as when you create an account, and information that is automatically collected, such as your IP address.</p>
                    <h2>2. How We Use Your Information</h2>
                    <p>We use the information we collect to provide, maintain, and improve our services, to develop new services, and to protect FixAm Ghana and our users.</p>
                    <h2>3. Sharing of Information</h2>
                    <p>We do not share your personal information with companies, organizations, or individuals outside of FixAm Ghana except in the following cases...</p>
                </CardContent>
            </Card>
        </div>
    );
}
