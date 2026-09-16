// Geolocation and Distance Calculation Utilities for noktag.com
import { Product } from '../types';

export interface UserGeoLocation {
  lat: number;
  lng: number;
  name: string;
  source: 'gps' | 'preset' | 'telegram';
  accuracyMeters?: number;
}

// Popular locations preset for quick selection & fallback
export const POPULAR_LOCATIONS: UserGeoLocation[] = [
  {
    name: 'İstanbul - Beşiktaş / Çarşı',
    lat: 41.0428,
    lng: 29.0077,
    source: 'preset',
  },
  {
    name: 'İstanbul - Kadıköy / Moda',
    lat: 40.9875,
    lng: 29.0258,
    source: 'preset',
  },
  {
    name: 'İstanbul - Şişli / Mecidiyeköy',
    lat: 41.0645,
    lng: 28.9922,
    source: 'preset',
  },
  {
    name: 'İstanbul - Üsküdar / Sahil',
    lat: 41.0267,
    lng: 29.0152,
    source: 'preset',
  },
  {
    name: 'Ankara - Çankaya / Kızılay & Tunalı',
    lat: 39.9030,
    lng: 32.8597,
    source: 'preset',
  },
  {
    name: 'İzmir - Konak / Alsancak Kordon',
    lat: 38.4356,
    lng: 27.1398,
    source: 'preset',
  },
];

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Pretty format distance
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} metre`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Extracts coordinates from a product (Dead drop has specific deadDropCoordinates, Live drop has district center lat/lng)
 */
export function getProductCoordinates(product: Product): { lat: number; lng: number } | null {
  if (product.deadDropCoordinates?.lat && product.deadDropCoordinates?.lng) {
    return {
      lat: product.deadDropCoordinates.lat,
      lng: product.deadDropCoordinates.lng,
    };
  }
  if (product.lat && product.lng) {
    return {
      lat: product.lat,
      lng: product.lng,
    };
  }
  // Fallbacks by city/district if missing
  const text = `${product.city} ${product.district}`.toLowerCase();
  if (text.includes('bebek') || text.includes('beşiktaş')) return { lat: 41.0772, lng: 29.0435 };
  if (text.includes('kadıköy') || text.includes('moda')) return { lat: 40.9875, lng: 29.0258 };
  if (text.includes('maçka') || text.includes('şişli')) return { lat: 41.0425, lng: 28.9958 };
  if (text.includes('alsancak') || text.includes('izmir')) return { lat: 38.4356, lng: 27.1398 };
  if (text.includes('çankaya') || text.includes('ankara')) return { lat: 39.9030, lng: 32.8597 };
  return null;
}

/**
 * Tries to parse location from user text message (e.g. "kadıköydeyim", "beşiktaşa yakın ne var", "41.04, 29.00")
 */
export function detectLocationFromText(text: string): UserGeoLocation | null {
  const clean = text.toLowerCase();

  // Check coordinates like "41.0428, 29.0077" or "41.04 29.00"
  const coordRegex = /(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
  const match = clean.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return {
        lat,
        lng,
        name: `GPS Koordinatı (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        source: 'telegram',
      };
    }
  }

  // Check Turkish district/city keywords
  if (clean.includes('bebek') || clean.includes('beşiktaş') || clean.includes('besiktas')) {
    return POPULAR_LOCATIONS[0];
  }
  if (clean.includes('kadıköy') || clean.includes('kadikoy') || clean.includes('moda') || clean.includes('caddebostan')) {
    return POPULAR_LOCATIONS[1];
  }
  if (clean.includes('şişli') || clean.includes('sisli') || clean.includes('mecidiyeköy') || clean.includes('maçka') || clean.includes('taksim')) {
    return POPULAR_LOCATIONS[2];
  }
  if (clean.includes('üsküdar') || clean.includes('uskudar')) {
    return POPULAR_LOCATIONS[3];
  }
  if (clean.includes('ankara') || clean.includes('çankaya') || clean.includes('cankaya') || clean.includes('tunalı') || clean.includes('kızılay')) {
    return POPULAR_LOCATIONS[4];
  }
  if (clean.includes('izmir') || clean.includes('alsancak') || clean.includes('kordon') || clean.includes('konak')) {
    return POPULAR_LOCATIONS[5];
  }

  return null;
}
