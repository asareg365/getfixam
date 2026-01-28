import Link from 'next/link';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import type { Category } from '@/lib/types';
import { cn } from '@/lib/utils';

type CategoryCardProps = {
  category: Category;
  className?: string;
};

export default function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = category.icon;
  return (
    <Link href={`/category/${category.slug}`} className="group block">
      <Card className={cn("h-full w-full transition-all duration-300 ease-in-out group-hover:shadow-lg group-hover:-translate-y-1 group-hover:border-primary", className)}>
        <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
          <div className="mb-3 rounded-full bg-primary/10 p-3 transition-colors group-hover:bg-primary">
            <Icon className="h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground" />
          </div>
          <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
        </CardContent>
      </Card>
    </Link>
  );
}
