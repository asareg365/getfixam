import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProviderAvailabilityPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Set Your Availability</CardTitle>
                <CardDescription>Let customers know when you are available to work.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-center text-muted-foreground py-12">Weekly availability calendar will be implemented here.</p>
            </CardContent>
        </Card>
    );
}
