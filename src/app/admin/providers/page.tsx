import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProvidersPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Providers</h1>
                    <p className="text-muted-foreground">Approve, edit, or suspend artisan listings.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Provider
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Provider List</CardTitle>
                     <CardDescription>A list of all providers in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-12 text-center">
                        <h2 className="text-xl font-semibold">Provider Management Coming Soon</h2>
                        <p className="mt-2 text-muted-foreground">
                            This is where you'll see a table of all providers and be able to manage them.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
