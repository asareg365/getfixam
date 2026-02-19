
import PublicLayout from '@/components/layout/PublicLayout';
import { ContactForm } from './form';

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-4 font-headline">Contact Us</h1>
            <p className="text-muted-foreground text-center mb-8">
              Have a complaint, a special request, or just want to say hello? Fill out the form below and we'll get back to you.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
