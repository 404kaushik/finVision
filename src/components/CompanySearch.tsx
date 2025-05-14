"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchIcon } from 'lucide-react';
import { sp500Companies } from '@/data/sp500-companies';

export default function CompanySearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle clicks outside the suggestions dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = sp500Companies.filter(
        company => 
          company.name.toLowerCase().includes(query.toLowerCase()) ||
          company.symbol.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 7); // Limit to 7 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (company?: string) => {
    const searchTerm = company || query;
    if (searchTerm) {
      router.push(`/research?company=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex w-full gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Search for a company..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="rounded-full pr-10 bg-background/60 backdrop-blur-sm"
          />
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button 
          className="rounded-full bg-primary text-white" 
          onClick={() => handleSearch()}
        >
          Search
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-12 left-0 right-0 z-10 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((company, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-muted cursor-pointer"
              onClick={() => {
                setQuery(company.name);
                setShowSuggestions(false);
                handleSearch(company.name);
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{company.symbol}</span>
                <span>{company.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}