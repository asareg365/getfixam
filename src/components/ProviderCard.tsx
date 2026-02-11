import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, CheckCircle, MapPin, Star } from 'lucide-react';
import type { Provider } from '@/lib/types';
import StarRating from './StarRating';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type ProviderCardProps = {
  provider: Provider;
};

export default function ProviderCard({ provider }: ProviderCardProps) {
  const providerImage = PlaceHolderImages.find(p => p.id === provider.imageId);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
      <Link href={`/providers/${provider.id}`} className="block">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={providerImage?.imageUrl || `https://picsum.photos/seed/${provider.id}/400/300`}
              alt={provider.name}
              fill
              className="object-cover"
              data-ai-hint={providerImage?.imageHint}
            />
            {provider.isFeatured && (
                <Badge className="absolute top-3 left-3 bg-yellow-500 text-white border-yellow-600">
                    <Star className="mr-1 h-3 w-3" /> Featured
                </Badge>
            )}
            {provider.verified && (
              <Badge variant="default" className="absolute top-3 right-3 bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="mr-1 h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex flex-wrap gap-1 mb-2">
            {provider.services?.map(service => (
                <Badge key={service.name} variant="secondary">{service.name}</Badge>
            ))}
          </div>
          <CardTitle className="text-lg font-bold font-headline mb-1 leading-tight">
            {provider.name}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="mr-1.5 h-4 w-4 shrink-0" />
            <span>{provider.location.zone}, {provider.location.city}</span>
          </div>
          <div className="flex items-center">
            <StarRating rating={provider.rating} size={18} />
            <span className="ml-2 text-xs text-muted-foreground">({provider.reviewCount} reviews)</span>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 mt-auto grid grid-cols-2 gap-2">
        <Button asChild className='w-full' variant="outline">
          <a href={`tel:${provider.phone}`}>
            <Phone className="mr-2 h-4 w-4" />
            Call
          </a>
        </Button>
        <Button asChild className='w-full'>
          <a href={`https://wa.me/233${provider.whatsapp.slice(1)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
