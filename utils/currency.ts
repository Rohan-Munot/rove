export interface UserLocation {
  country: string;
  currency: string;
  timezone: string;
  language: string;
}

const COMMON_LOCATIONS: Record<string, UserLocation> = {
  US: {
    country: "United States",
    currency: "USD",
    timezone: "America/New_York",
    language: "en",
  },
  IN: {
    country: "India",
    currency: "INR",
    timezone: "Asia/Kolkata",
    language: "en",
  },
  GB: {
    country: "United Kingdom",
    currency: "GBP",
    timezone: "Europe/London",
    language: "en",
  },
  DE: {
    country: "Germany",
    currency: "EUR",
    timezone: "Europe/Berlin",
    language: "de",
  },
  FR: {
    country: "France",
    currency: "EUR",
    timezone: "Europe/Paris",
    language: "fr",
  },
  JP: {
    country: "Japan",
    currency: "JPY",
    timezone: "Asia/Tokyo",
    language: "ja",
  },
  AU: {
    country: "Australia",
    currency: "AUD",
    timezone: "Australia/Sydney",
    language: "en",
  },
  CA: {
    country: "Canada",
    currency: "CAD",
    timezone: "America/Toronto",
    language: "en",
  },
  BR: {
    country: "Brazil",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    language: "pt",
  },
  MX: {
    country: "Mexico",
    currency: "MXN",
    timezone: "America/Mexico_City",
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
