import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from "@/components/layout/PublicLayout";
import { Clock } from "lucide-react";

export default function ProviderPendingPage() {
    return (
        <PublicLayout>
            <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full w-fit mb-4">
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Account Pending</CardTitle>
                        <CardDescription>Thank you for your submission!</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">
                            Our team is currently reviewing your business listing. You will be notified via WhatsApp or phone call once your account has been approved. Thank you for your patience.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
