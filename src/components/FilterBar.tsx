'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ListFilter, X } from 'lucide-react';

type FilterBarProps = {
  onFilterChange: (filters: { zone: string; verified: boolean }) => void;
  zones: string[];
};

export default function FilterBar({ onFilterChange, zones }: FilterBarProps) {
  const [selectedZone, setSelectedZone] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const handleApply = () => {
    onFilterChange({
      zone: selectedZone,
      verified: verifiedOnly,
    });
  };

  const handleClear = () => {
      setSelectedZone('');
      setVerifiedOnly(false);
      onFilterChange({
          zone: '',
          verified: false,
      });
  }

  return (
    <div className="bg-muted/60 p-4 rounded-lg mb-8 flex flex-col md:flex-row gap-4 items-center border">
        <h3 className="text-lg font-semibold hidden md:flex items-center gap-2 mr-4 flex-shrink-0">
            <ListFilter className="h-5 w-5" />
            <span>Filter By</span>
        </h3>
        <div className="w-full md:w-auto">
            <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger className="w-full md:w-[200px] bg-background">
                <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                    {zone}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>

        <div className="flex items-center space-x-2">
            <Checkbox id="verified" checked={verifiedOnly} onCheckedChange={(checked) => setVerifiedOnly(Boolean(checked))} />
            <Label htmlFor="verified" className="cursor-pointer">Verified Only</Label>
        </div>

        <div className="flex gap-2 ml-0 md:ml-auto">
            <Button variant="ghost" onClick={handleClear} disabled={!selectedZone && !verifiedOnly}>
                <X className="mr-2 h-4 w-4" />
                Clear
            </Button>
            <Button onClick={handleApply}>Apply</Button>
        </div>
    </div>
  );
}
