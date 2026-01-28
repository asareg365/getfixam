import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 md:px-6 py-12">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Terms of Service</CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert">
                    <p>Placeholder for Terms of Service. Please replace this with your actual terms.</p>
                    <h2>1. Introduction</h2>
                    <p>Welcome to FixAm Ghana. These terms and conditions outline the rules and regulations for the use of FixAm Ghana's Website, located at your-domain.com.</p>
                    <h2>2. Intellectual Property Rights</h2>
                    <p>Other than the content you own, under these Terms, FixAm Ghana and/or its licensors own all the intellectual property rights and materials contained in this Website.</p>
                    <h2>3. Restrictions</h2>
                    <p>You are specifically restricted from all of the following: publishing any Website material in any other media; selling, sublicensing and/or otherwise commercializing any Website material...</p>
                </CardContent>
            </Card>
        </div>
    );
}
