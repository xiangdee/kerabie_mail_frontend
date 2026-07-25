'use client';
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useCountries, type Country } from '@/lib/hooks/useCountries';

interface Props {
  value: Country | null;
  onChange: (country: Country) => void;
}

export function CountrySelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { data: countries = [], isLoading } = useCountries();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[110px] justify-between shrink-0"
        >
          <span className="flex items-center gap-1.5 truncate">
            {value?.flag_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.flag_url} alt="" className="h-3.5 w-5 object-cover rounded-[2px]" />
            )}
            {value?.phonecode ?? '+...'}
          </span>
          <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Search country or code..." />
          <CommandList>
            <CommandEmpty>{isLoading ? 'Loading...' : 'No country found.'}</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.country} ${c.phonecode} ${c.iso2}`}
                  onSelect={() => { onChange(c); setOpen(false); }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value?.id === c.id ? 'opacity-100' : 'opacity-0')} />
                  {c.flag_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.flag_url} alt="" className="h-3.5 w-5 object-cover rounded-[2px] mr-2" />
                  )}
                  <span className="flex-1 truncate">{c.country}</span>
                  <span className="text-muted-foreground text-xs">{c.phonecode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
