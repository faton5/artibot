"use client";

import { useEffect, useState } from "react";

import { geoApi } from "@/lib/api";
import type { CitySuggestion } from "@/types";
import { cn } from "@/lib/utils";

interface CityAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (city: CitySuggestion) => void;
  placeholder?: string;
}

export function CityAutocomplete({
  id,
  value,
  onChange,
  onSelect,
  placeholder = "Rennes",
}: CityAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CitySuggestion[]>([]);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await geoApi.searchCities(query));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [value]);

  const showResults = isFocused && (results.length > 0 || loading || value.trim().length >= 2);

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        placeholder={placeholder}
        autoComplete="off"
        className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      />

      {showResults && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {loading && <p className="px-3 py-2 text-sm text-gray-500">Recherche des communes...</p>}

          {!loading && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-500">Aucune commune trouvée</p>
          )}

          {!loading && results.length > 0 && (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((city) => (
                <li key={`${city.insee_code}-${city.postal_code ?? city.name}`}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(city.name);
                      onSelect?.(city);
                      setResults([]);
                      setIsFocused(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left transition-colors hover:bg-gray-50",
                      city.name === value ? "bg-blue-50" : ""
                    )}
                  >
                    <p className="text-sm font-medium text-gray-900">{city.name}</p>
                    <p className="text-xs text-gray-500">{city.label}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
