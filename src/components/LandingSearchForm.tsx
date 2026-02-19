'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CATEGORIES, NEIGHBORHOODS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Intelligent Hero Search Form with Autocomplete.
 * Provides real-time suggestions for service categories and neighborhoods.
 */
export default function LandingSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showQuerySuggestions, setShowQuerySuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  
  const queryRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside the component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (queryRef.current && !queryRef.current.contains(event.target as Node)) {
        setShowQuerySuggestions(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter and sort categories based on input
  const filteredCategories = CATEGORIES.filter(cat => 
    query && cat.name.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase());
    const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase());
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.name.localeCompare(b.name);
  }).slice(0, 6);

  // Filter and sort areas based on input
  const filteredAreas = NEIGHBORHOODS.filter(area => 
    location && area.toLowerCase().includes(location.toLowerCase())
  ).sort((a, b) => {
    const aStarts = a.toLowerCase().startsWith(location.toLowerCase());
    const bStarts = b.toLowerCase().startsWith(location.toLowerCase());
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.localeCompare(b);
  }).slice(0, 6);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!query && !location) {
      router.push('/category/all');
      return;
    }

    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="p-3 bg-white rounded-[32px] md:rounded-full shadow-2xl border border-primary/10 flex flex-col md:flex-row gap-2 relative">
        <form onSubmit={handleSearch} className="flex-1 flex flex-col md:flex-row gap-2">
          
          {/* Service Search Input */}
          <div ref={queryRef} className="flex-1 relative">
            <div className="flex items-center px-5 h-14 border-b md:border-b-0 md:border-r border-muted group transition-all">
              <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0 group-focus-within:text-primary transition-colors" />
              <input 
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowQuerySuggestions(true);
                }}
                onFocus={() => setShowQuerySuggestions(true)}
                className="flex-1 bg-transparent focus:outline-none text-lg font-medium placeholder:text-muted-foreground/50 w-full" 
                placeholder="What skill do you need?" 
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setShowQuerySuggestions(false); }} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {/* Service Suggestions Pop-up */}
            {showQuerySuggestions && filteredCategories.length > 0 && (
              <div className="absolute top-[calc(100%+12px)] left-0 right-0 md:left-2 z-50 bg-white rounded-3xl shadow-2xl border border-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Suggested Services</p>
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className="w-full text-left px-4 py-3.5 hover:bg-primary/5 rounded-2xl transition-all flex items-center justify-between group"
                      onClick={() => {
                        setQuery(cat.name);
                        setShowQuerySuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary transition-colors">
                          <Search className="h-4 w-4 text-primary group-hover:text-white" />
                        </div>
                        <span className="font-bold text-foreground">{cat.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Area Search Input */}
          <div ref={locationRef} className="flex-1 relative">
            <div className="flex items-center px-5 h-14 group transition-all">
              <MapPin className="h-5 w-5 text-muted-foreground mr-3 shrink-0 group-focus-within:text-secondary transition-colors" />
              <input 
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setShowLocationSuggestions(true);
                }}
                onFocus={() => setShowLocationSuggestions(true)}
                className="flex-1 bg-transparent focus:outline-none text-lg font-medium placeholder:text-muted-foreground/50 w-full" 
                placeholder="Where in Berekum?" 
              />
              {location && (
                <button type="button" onClick={() => { setLocation(''); setShowLocationSuggestions(false); }} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Area Suggestions Pop-up */}
            {showLocationSuggestions && filteredAreas.length > 0 && (
              <div className="absolute top-[calc(100%+12px)] left-0 right-0 md:right-2 z-50 bg-white rounded-3xl shadow-2xl border border-secondary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Berekum Neighborhoods</p>
                  {filteredAreas.map((area) => (
                    <button
                      key={area}
                      type="button"
                      className="w-full text-left px-4 py-3.5 hover:bg-secondary/5 rounded-2xl transition-all flex items-center justify-between group"
                      onClick={() => {
                        setLocation(area);
                        setShowLocationSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-secondary/10 p-2 rounded-xl group-hover:bg-secondary transition-colors">
                          <MapPin className="h-4 w-4 text-secondary group-hover:text-white" />
                        </div>
                        <span className="font-bold text-foreground">{area}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="rounded-2xl md:rounded-full h-14 px-10 shrink-0 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
            Find Help
          </Button>
        </form>
      </div>
      <p className="mt-6 text-center text-muted-foreground/60 text-sm font-medium">
        Example: Try searching for <span className="text-primary font-bold">"Electrician"</span> in <span className="text-secondary font-bold">"Biadan"</span>
      </p>
    </div>
  );
}
