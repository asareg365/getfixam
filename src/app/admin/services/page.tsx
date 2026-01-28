import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ServicesPage() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Services</h1>
                    <p className="text-muted-foreground">Add, edit, or deactivate service categories.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Service
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Service Categories</CardTitle>
                    <CardDescription>A list of all service categories available in the app.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-12 text-center">
                        <h2 className="text-xl font-semibold">Service Management Coming Soon</h2>
                        <p className="mt-2 text-muted-foreground">
                            This is where you'll see a list of all services and be able to manage them.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
