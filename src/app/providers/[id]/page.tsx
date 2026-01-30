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
import { Phone, MessageCircle, CheckCircle, MapPin, Home, Plus } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const provider = await getProviderById(params.id);
  if (!provider) {
    return { title: 'Provider Not Found' };
  }
  return {
    title: `${provider.name} | FixAm Ghana`,
    description: `Contact and review ${provider.name}, a ${provider.category.toLowerCase()} in ${provider.location.zone}.`,
  };
}

export default async function ProviderDetailPage({ params }: { params: { id: string } }) {
  const provider = await getProviderById(params.id);
  if (!provider) {
    notFound();
  }

  const providerImage = PlaceHolderImages.find(p => p.id === provider.imageId);

  return (
    <PublicLayout>
        <div className="bg-background">
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
            <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors flex items-center">
                <Home className="h-4 w-4 mr-2" />
                Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/category/${provider.category.toLowerCase().replace(' ', '-')}`} className="hover:text-primary transition-colors">
                {provider.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{provider.name}</span>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-1">
                <Card className="sticky top-24">
                <CardHeader className="p-0">
                    <div className="relative h-60 w-full">
                    <Image
                        src={providerImage?.imageUrl || `https://picsum.photos/seed/${provider.id}/400/300`}
                        alt={provider.name}
                        fill
                        className="object-cover rounded-t-lg"
                        data-ai-hint={providerImage?.imageHint}
                    />
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-2">{provider.category}</Badge>
                    <h1 className="text-2xl font-bold font-headline">{provider.name}</h1>
                    <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="mr-1.5 h-4 w-4" />
                    <span>{provider.location.zone}, {provider.location.city}</span>
                    </div>
                    {provider.verified && (
                    <div className="flex items-center text-green-600 text-sm font-semibold mt-2">
                        <CheckCircle className="mr-1.5 h-4 w-4" />
                        <span>Verified Artisan</span>
                    </div>
                    )}
                    <div className="flex items-center mt-3">
                    <StarRating rating={provider.rating} size={20} />
                    <span className="ml-3 text-sm text-muted-foreground">
                        ({provider.reviewCount} review{provider.reviewCount !== 1 ? 's' : ''})
                    </span>
                    </div>
                    <Separator className="my-6" />
                    <div className="space-y-3">
                    <Button asChild className='w-full'>
                        <a href={`https://wa.me/233${provider.whatsapp.slice(1)}`} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Chat on WhatsApp
                        </a>
                    </Button>
                    <Button asChild className='w-full' variant="outline">
                        <a href={`tel:${provider.phone}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            Call Now
                        </a>
                    </Button>
                    </div>
                </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-headline">Reviews</h2>
                    <Button asChild>
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
    </PublicLayout>
  );
}
