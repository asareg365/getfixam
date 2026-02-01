import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProviderServicesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Your Services</CardTitle>
                <CardDescription>Add, edit, or remove the specific services you offer to customers.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-12">Service management functionality will be implemented here.</p>
            </CardContent>
        </Card>
    );
}
