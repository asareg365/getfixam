import PublicLayout from '@/components/layout/PublicLayout';
import { ContactForm } from './form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCityConfig } from '@/lib/constants';

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function ContactPage({ params }: PageProps) {
  const { city } = await params;
  const config = getCityConfig(city);

  return (
    <PublicLayout>
      <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="max-w-2xl mx-auto">
            <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden">
                <div className="h-2 bg-primary w-full" />
                <CardHeader className="text-center p-8 md:p-12">
                    <CardTitle className="text-4xl font-black font-headline text-primary tracking-tight">Contact Fixam {config.name}</CardTitle>
                    <CardDescription className="text-lg mt-2 font-medium">
                        Have a complaint, a special request, or just want to say hello? Our local team is here to help.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:p-12 pt-0">
                    <ContactForm />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
