"use client";

import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import { artisanApi } from "@/lib/api";

export function useCurrentArtisan() {
  const { user, isLoaded } = useUser();

  const { data: artisan, isLoading, error } = useSWR(
    isLoaded && user ? ["artisan-by-clerk", user.id] : null,
    () => artisanApi.getByClerkId(user!.id),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    artisan: artisan ?? null,
    artisanId: artisan?.id ?? null,
    isLoading: !isLoaded || isLoading,
    needsOnboarding: isLoaded && !isLoading && !artisan,
    error,
  };
}
