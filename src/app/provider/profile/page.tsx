import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProviderProfilePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Your Profile</CardTitle>
                <CardDescription>Update your business name, location, and contact information.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-12">Profile editing form will be implemented here.</p>
            </CardContent>
        </Card>
    );
}
