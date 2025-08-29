export interface UserLocation {
  country: string;
  currency: string;
  language: string;
}

const COMMON_LOCATIONS: Record<string, UserLocation> = {
  US: {
    country: "United States",
    currency: "USD",
    language: "en",
  },
  IN: {
    country: "India",
    currency: "INR",
    language: "en",
  },
  GB: {
    country: "United Kingdom",
    currency: "GBP",
    language: "en",
  },
  DE: {
    country: "Germany",
    currency: "EUR",
    language: "de",
  },
  FR: {
    country: "France",
    currency: "EUR",
    language: "fr",
  },
  JP: {
    country: "Japan",
    currency: "JPY",
    language: "ja",
  },
  AU: {
    country: "Australia",
    currency: "AUD",
    language: "en",
  },
  CA: {
    country: "Canada",
    currency: "CAD",
    language: "en",
  },
  BR: {
    country: "Brazil",
    currency: "BRL",
    language: "pt",
  },
  MX: {
    country: "Mexico",
    currency: "MXN",
    language: "es",
  },
};

export const DEFAULT_LOCATION: UserLocation = COMMON_LOCATIONS["US"];

export function getLocationByCountryCode(countryCode: string): UserLocation {
  return COMMON_LOCATIONS[countryCode.toUpperCase()] || DEFAULT_LOCATION;
}

export function getAllSupportedCountries(): string[] {
  return Object.values(COMMON_LOCATIONS).map((loc) => loc.country);
}
