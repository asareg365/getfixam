import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProviderById } from '@/lib/services';
import { PlaceHolderImages } from '@/lib/placeholder-images';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StarRating from '@/components/StarRating';
import ProviderReviews from '@/components/ProviderReviews';
import { Phone, MessageCircle, CheckCircle, MapPin, Home, Plus, Star } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { ContactButton } from '@/components/ContactButton';
import { RequestAvailabilityForm } from './request-availability-form';

export const dynamic = "force-dynamic";

export default async function ProviderDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const provider = await getProviderById(params.id);
  if (!provider) {
    notFound();
  }

  const providerImage = PlaceHolderImages.find(p => p.id === provider.imageId);
  const citySlug = provider.location.city.toLowerCase();
  const cityPath = `/${citySlug}`;

  return (
    <PublicLayout>
      <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href={cityPath} className="hover:text-primary transition-colors flex items-center">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={`${cityPath}/category/${provider.category.toLowerCase().replace(' ', '-')}`} className="hover:text-primary transition-colors">
              {provider.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{provider.name}</span>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-1">
              <Card className="sticky top-24 border-none shadow-xl rounded-[32px] overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-60 w-full">
                    <Image
                      src={providerImage?.imageUrl || `https://picsum.photos/seed/${provider.id}/400/300`}
                      alt={provider.name}
                      fill
                      className="object-cover"
                      data-ai-hint={providerImage?.imageHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Badge variant="secondary" className="mb-2">{provider.category}</Badge>
                  <h1 className="text-2xl font-bold font-headline leading-tight">{provider.name}</h1>
                  <div className="flex items-center text-muted-foreground text-sm mt-2 font-medium">
                    <MapPin className="mr-1.5 h-4 w-4" />
                    <span>{provider.location.zone}, {provider.location.city}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {provider.isFeatured && (
                      <Badge className="border-transparent bg-yellow-500 text-white font-bold">
                        <Star className="mr-1.5 h-3.5 w-3.5 fill-white" />
                        Featured
                      </Badge>
                    )}
                    {provider.verified && (
                      <Badge variant="success" className="font-bold">
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-4">
                    <StarRating rating={provider.rating} size={20} />
                    <span className="ml-3 text-sm text-muted-foreground font-bold">
                      ({provider.reviewCount} review{provider.reviewCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <Separator className="my-6" />
                  <div className="space-y-3 hidden md:block">
                    <ContactButton provider={provider} type="whatsapp" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-green-500/10" variant="default">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat on WhatsApp
                    </ContactButton>
                    <ContactButton provider={provider} type="call" className="w-full h-12 rounded-xl font-bold border-2" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call Now
                    </ContactButton>
                    <RequestAvailabilityForm artisanId={provider.id} />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black font-headline tracking-tight text-primary">Reviews</h2>
                <Button asChild className="rounded-xl font-bold shadow-lg shadow-primary/20">
                  <Link href={`/providers/${provider.id}/add-review`}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add Review
                  </Link>
                </Button>
              </div>
              <ProviderReviews providerId={provider.id} providerName={provider.name} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="container mx-auto flex items-center gap-3">
          <ContactButton provider={provider} type="call" className="flex-1 h-12 rounded-xl font-bold border-2" variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            Call
          </ContactButton>
          <ContactButton provider={provider} type="whatsapp" className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </ContactButton>
        </div>
      </div>
    </PublicLayout>
  );
}
