import { useQuery } from '@tanstack/react-query';
import { customAxiosGet } from '@/lib/utils/CustomAxiosRequest';
import { apiLink } from '@/lib/constants/links';

export interface Country {
  id: number;
  country: string;
  iso2: string | null;
  iso3: string | null;
  phonecode: string | null;
  flag_url: string | null;
}

export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await customAxiosGet(`${apiLink}/countries`);
      return res.status === true ? (res.response as Country[]) : ([] as Country[]);
    },
    staleTime: 24 * 60 * 60 * 1000, // matches backend's 24h Redis cache
  });
}

export function useDetectCountry() {
  return useQuery({
    queryKey: ['countries', 'detect'],
    queryFn: async () => {
      const res = await customAxiosGet(`${apiLink}/countries/detect`);
      return res.status === true ? (res.response as Country | null) : null;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}
