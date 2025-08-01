/**
 * useLocationGeocoding Hook - Pure Function Unit Tests
 * @description Tests for pure coordinate validation and utility functions
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 */

import { describe, test, expect } from "vitest";

// Pure helper functions extracted for testing
export const useLocationGeocodingHelpers = {
  /**
   * Check if coordinates are within Singapore bounds
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns Boolean indicating if coordinates are in Singapore
   */
  isValidSingaporeCoordinates: (lat: number, lng: number): boolean => {
    const SINGAPORE_BOUNDS = {
      minLat: 1.2290,
      maxLat: 1.4784,
      minLng: 103.6000,
      maxLng: 104.0120
    };
    
    return lat >= SINGAPORE_BOUNDS.minLat && 
           lat <= SINGAPORE_BOUNDS.maxLat &&
           lng >= SINGAPORE_BOUNDS.minLng && 
           lng <= SINGAPORE_BOUNDS.maxLng;
  },

  /**
   * Calculate exponential backoff delay
   * @param attempt - Attempt number (0-based)
   * @param baseDelay - Base delay in milliseconds
   * @param maxDelay - Maximum delay in milliseconds
   * @returns Calculated delay
   */
  calculateDelay: (attempt: number, baseDelay: number = 1000, maxDelay: number = 10000): number => {
    const delay = baseDelay * Math.pow(2, attempt);
    return Math.min(delay, maxDelay);
  },

  /**
   * Create cache key from address
   * @param address - Address string
   * @returns Normalized cache key
   */
  createCacheKey: (address: string): string => {
    return address.toLowerCase().trim();
  },

  /**
   * Validate coordinate input
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns Validation result
   */
  validateCoordinates: (lat: number, lng: number): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (typeof lat !== 'number' || isNaN(lat)) {
      errors.push("Latitude must be a valid number");
    } else if (lat < -90 || lat > 90) {
      errors.push("Latitude must be between -90 and 90");
    }

    if (typeof lng !== 'number' || isNaN(lng)) {
      errors.push("Longitude must be a valid number");
    } else if (lng < -180 || lng > 180) {
      errors.push("Longitude must be between -180 and 180");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * @param lat1 - First latitude
   * @param lng1 - First longitude
   * @param lat2 - Second latitude
   * @param lng2 - Second longitude
   * @returns Distance in kilometers
   */
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  /**
   * Format coordinates for display
   * @param lat - Latitude
   * @param lng - Longitude
   * @param precision - Decimal places
   * @returns Formatted coordinate string
   */
  formatCoordinates: (lat: number, lng: number, precision: number = 6): string => {
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
  },

  /**
   * Parse coordinate string
   * @param coordString - Coordinate string in format "lat,lng"
   * @returns Parsed coordinates or null if invalid
   */
  parseCoordinates: (coordString: string): [number, number] | null => {
    if (!coordString || typeof coordString !== 'string') return null;
    
    const parts = coordString.split(',');
    if (parts.length !== 2) return null;
    
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    return [lat, lng];
  },

  /**
   * Check if address appears to be Singapore address
   * @param address - Address string
   * @returns Boolean indicating if address appears to be Singapore
   */
  appearsToBeSingaporeAddress: (address: string): boolean => {
    if (!address) return false;
    
    const singaporeIndicators = [
      /singapore/i,
      /\b\d{6}\b/, // 6-digit postal code
      /\bblk\s+\d+/i, // Block number
      /\b(orchard|marina bay|bugis|chinatown|little india|kampong glam|downtown core|jurong|tampines|woodlands|yishun|ang mo kio|toa payoh|bedok|hougang|punggol|sengkang)/i
    ];
    
    return singaporeIndicators.some(pattern => pattern.test(address));
  }
};

describe("useLocationGeocoding - Pure Functions Unit Tests", () => {
  describe("isValidSingaporeCoordinates - Boundary Value Testing", () => {
    test("validates coordinates within Singapore bounds", () => {
      const { isValidSingaporeCoordinates } = useLocationGeocodingHelpers;
      
      // Valid coordinates within Singapore
      expect(isValidSingaporeCoordinates(1.2290, 103.6000)).toBe(true);  // min lat, min lng
      expect(isValidSingaporeCoordinates(1.4784, 104.0120)).toBe(true);  // max lat, max lng
      expect(isValidSingaporeCoordinates(1.3537, 103.8060)).toBe(true);  // center Singapore
    });

    test("rejects coordinates outside Singapore bounds", () => {
      const { isValidSingaporeCoordinates } = useLocationGeocodingHelpers;
      
      // Invalid coordinates outside Singapore
      expect(isValidSingaporeCoordinates(1.2289, 103.8060)).toBe(false); // below min lat
      expect(isValidSingaporeCoordinates(1.4785, 103.8060)).toBe(false); // above max lat
      expect(isValidSingaporeCoordinates(1.3537, 103.5999)).toBe(false); // below min lng
      expect(isValidSingaporeCoordinates(1.3537, 104.0121)).toBe(false); // above max lng
    });

    test("handles exact boundary values", () => {
      const { isValidSingaporeCoordinates } = useLocationGeocodingHelpers;
      
      // Exact boundary values should be valid
      expect(isValidSingaporeCoordinates(1.2290, 103.8060)).toBe(true);  // min lat
      expect(isValidSingaporeCoordinates(1.4784, 103.8060)).toBe(true);  // max lat
      expect(isValidSingaporeCoordinates(1.3537, 103.6000)).toBe(true);  // min lng
      expect(isValidSingaporeCoordinates(1.3537, 104.0120)).toBe(true);  // max lng
    });

    test("handles edge cases", () => {
      const { isValidSingaporeCoordinates } = useLocationGeocodingHelpers;
      
      expect(isValidSingaporeCoordinates(0, 0)).toBe(false);              // origin
      expect(isValidSingaporeCoordinates(-1.3537, 103.8060)).toBe(false); // negative lat
      expect(isValidSingaporeCoordinates(1.3537, -103.8060)).toBe(false); // negative lng
    });
  });

  describe("calculateDelay - Exponential Backoff Testing", () => {
    test("calculates exponential backoff progression", () => {
      const { calculateDelay } = useLocationGeocodingHelpers;
      
      expect(calculateDelay(0)).toBe(1000);    // 2^0 * 1000 = 1000
      expect(calculateDelay(1)).toBe(2000);    // 2^1 * 1000 = 2000
      expect(calculateDelay(2)).toBe(4000);    // 2^2 * 1000 = 4000
      expect(calculateDelay(3)).toBe(8000);    // 2^3 * 1000 = 8000
      expect(calculateDelay(4)).toBe(10000);   // 2^4 * 1000 = 16000, capped at 10000
    });

    test("respects maximum delay cap", () => {
      const { calculateDelay } = useLocationGeocodingHelpers;
      
      expect(calculateDelay(10)).toBe(10000);  // Should be capped at maxDelay
      expect(calculateDelay(20)).toBe(10000);  // Should be capped at maxDelay
    });

    test("handles custom parameters", () => {
      const { calculateDelay } = useLocationGeocodingHelpers;
      
      expect(calculateDelay(2, 500, 5000)).toBe(2000);  // 2^2 * 500 = 2000
      expect(calculateDelay(5, 500, 5000)).toBe(5000);  // Capped at 5000
    });

    test("handles zero attempt", () => {
      const { calculateDelay } = useLocationGeocodingHelpers;
      
      expect(calculateDelay(0, 2000)).toBe(2000);  // 2^0 * 2000 = 2000
    });
  });

  describe("createCacheKey - String Normalization", () => {
    test("normalizes address strings for caching", () => {
      const { createCacheKey } = useLocationGeocodingHelpers;
      
      expect(createCacheKey("123 Main Street")).toBe("123 main street");
      expect(createCacheKey("  123 Main Street  ")).toBe("123 main street");
      expect(createCacheKey("UPPER CASE ADDRESS")).toBe("upper case address");
    });

    test("handles empty and edge cases", () => {
      const { createCacheKey } = useLocationGeocodingHelpers;
      
      expect(createCacheKey("")).toBe("");
      expect(createCacheKey("   ")).toBe("");
      expect(createCacheKey("a")).toBe("a");
    });

    test("preserves numbers and special characters", () => {
      const { createCacheKey } = useLocationGeocodingHelpers;
      
      expect(createCacheKey("123-456 Main St #01-02")).toBe("123-456 main st #01-02");
    });
  });

  describe("validateCoordinates - Input Validation", () => {
    test("validates correct coordinate ranges", () => {
      const { validateCoordinates } = useLocationGeocodingHelpers;
      
      const result = validateCoordinates(1.3537, 103.8060);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("validates boundary coordinate values", () => {
      const { validateCoordinates } = useLocationGeocodingHelpers;
      
      expect(validateCoordinates(-90, -180).isValid).toBe(true);  // min boundaries
      expect(validateCoordinates(90, 180).isValid).toBe(true);    // max boundaries
      expect(validateCoordinates(0, 0).isValid).toBe(true);       // origin
    });

    test("rejects coordinates outside valid ranges", () => {
      const { validateCoordinates } = useLocationGeocodingHelpers;
      
      const result1 = validateCoordinates(-91, 103.8060);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain("Latitude must be between -90 and 90");

      const result2 = validateCoordinates(1.3537, 181);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain("Longitude must be between -180 and 180");
    });

    test("rejects non-numeric inputs", () => {
      const { validateCoordinates } = useLocationGeocodingHelpers;
      
      const result1 = validateCoordinates(NaN, 103.8060);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain("Latitude must be a valid number");

      const result2 = validateCoordinates(1.3537, "invalid" as any);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain("Longitude must be a valid number");
    });

    test("accumulates multiple validation errors", () => {
      const { validateCoordinates } = useLocationGeocodingHelpers;
      
      const result = validateCoordinates(-100, 200);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Latitude must be between -90 and 90");
      expect(result.errors).toContain("Longitude must be between -180 and 180");
    });
  });

  describe("calculateDistance - Haversine Formula", () => {
    test("calculates distance between known points", () => {
      const { calculateDistance } = useLocationGeocodingHelpers;
      
      // Distance between Singapore CBD and Changi Airport (approximately 17.2km)
      const distance = calculateDistance(1.2966, 103.8520, 1.3644, 103.9915);
      expect(distance).toBeCloseTo(17.24, 1); // Within 0.1km accuracy
    });

    test("calculates zero distance for same coordinates", () => {
      const { calculateDistance } = useLocationGeocodingHelpers;
      
      const distance = calculateDistance(1.3537, 103.8060, 1.3537, 103.8060);
      expect(distance).toBe(0);
    });

    test("calculates distance for small coordinate differences", () => {
      const { calculateDistance } = useLocationGeocodingHelpers;
      
      // Very small distance (about 100 meters)
      const distance = calculateDistance(1.3537, 103.8060, 1.3547, 103.8070);
      expect(distance).toBeLessThan(2); // Should be less than 2km
      expect(distance).toBeGreaterThan(0);
    });

    test("handles edge cases", () => {
      const { calculateDistance } = useLocationGeocodingHelpers;
      
      // Distance from equator to pole should be about 10,000km
      const distance = calculateDistance(0, 0, 90, 0);
      expect(distance).toBeCloseTo(10000, -2); // Within 100km accuracy
    });
  });

  describe("formatCoordinates - String Formatting", () => {
    test("formats coordinates with default precision", () => {
      const { formatCoordinates } = useLocationGeocodingHelpers;
      
      expect(formatCoordinates(1.3537, 103.8060)).toBe("1.353700, 103.806000");
    });

    test("formats coordinates with custom precision", () => {
      const { formatCoordinates } = useLocationGeocodingHelpers;
      
      expect(formatCoordinates(1.3537, 103.8060, 2)).toBe("1.35, 103.81");
      expect(formatCoordinates(1.3537, 103.8060, 0)).toBe("1, 104");
    });

    test("handles negative coordinates", () => {
      const { formatCoordinates } = useLocationGeocodingHelpers;
      
      expect(formatCoordinates(-1.3537, -103.8060, 2)).toBe("-1.35, -103.81");
    });

    test("handles zero coordinates", () => {
      const { formatCoordinates } = useLocationGeocodingHelpers;
      
      expect(formatCoordinates(0, 0, 1)).toBe("0.0, 0.0");
    });
  });

  describe("parseCoordinates - String Parsing", () => {
    test("parses valid coordinate strings", () => {
      const { parseCoordinates } = useLocationGeocodingHelpers;
      
      expect(parseCoordinates("1.3537,103.8060")).toEqual([1.3537, 103.8060]);
      expect(parseCoordinates("1.3537, 103.8060")).toEqual([1.3537, 103.8060]);
      expect(parseCoordinates(" 1.3537 , 103.8060 ")).toEqual([1.3537, 103.8060]);
    });

    test("parses negative coordinates", () => {
      const { parseCoordinates } = useLocationGeocodingHelpers;
      
      expect(parseCoordinates("-1.3537,-103.8060")).toEqual([-1.3537, -103.8060]);
    });

    test("returns null for invalid formats", () => {
      const { parseCoordinates } = useLocationGeocodingHelpers;
      
      expect(parseCoordinates("")).toBeNull();
      expect(parseCoordinates("1.3537")).toBeNull();
      expect(parseCoordinates("1.3537,103.8060,extra")).toBeNull();
      expect(parseCoordinates("invalid,coordinates")).toBeNull();
      expect(parseCoordinates("1.3537,")).toBeNull();
      expect(parseCoordinates(",103.8060")).toBeNull();
    });

    test("handles null and undefined inputs", () => {
      const { parseCoordinates } = useLocationGeocodingHelpers;
      
      expect(parseCoordinates(null as any)).toBeNull();
      expect(parseCoordinates(undefined as any)).toBeNull();
    });
  });

  describe("appearsToBeSingaporeAddress - Pattern Recognition", () => {
    test("identifies Singapore addresses by common patterns", () => {
      const { appearsToBeSingaporeAddress } = useLocationGeocodingHelpers;
      
      const singaporeAddresses = [
        "123 Main Street, Singapore",
        "Blk 456 Central Avenue 123456",
        "789 Orchard Road",
        "Marina Bay Sands",
        "Bugis Street Market",
        "Little India Heritage Trail",
        "Jurong East MRT Station",
        "Tampines Mall",
        "Woodlands Checkpoint"
      ];
      
      singaporeAddresses.forEach(address => {
        expect(appearsToBeSingaporeAddress(address)).toBe(true);
      });
    });

    test("rejects non-Singapore addresses", () => {
      const { appearsToBeSingaporeAddress } = useLocationGeocodingHelpers;
      
      const nonSingaporeAddresses = [
        "123 Main St, New York",
        "456 Central Ave, London",
        "789 High Street, Sydney",
        "Random Address 12345", // 5-digit postal code
        "Generic Street Name"
      ];
      
      nonSingaporeAddresses.forEach(address => {
        expect(appearsToBeSingaporeAddress(address)).toBe(false);
      });
    });

    test("handles edge cases", () => {
      const { appearsToBeSingaporeAddress } = useLocationGeocodingHelpers;
      
      expect(appearsToBeSingaporeAddress("")).toBe(false);
      expect(appearsToBeSingaporeAddress(null as any)).toBe(false);
      expect(appearsToBeSingaporeAddress("123")).toBe(false);
    });

    test("is case insensitive", () => {
      const { appearsToBeSingaporeAddress } = useLocationGeocodingHelpers;
      
      expect(appearsToBeSingaporeAddress("SINGAPORE")).toBe(true);
      expect(appearsToBeSingaporeAddress("singapore")).toBe(true);
      expect(appearsToBeSingaporeAddress("Singapore")).toBe(true);
      expect(appearsToBeSingaporeAddress("ORCHARD ROAD")).toBe(true);
    });
  });

  describe("Integration - Combined Operations", () => {
    test("validates and formats Singapore coordinates", () => {
      const {
        validateCoordinates,
        isValidSingaporeCoordinates,
        formatCoordinates
      } = useLocationGeocodingHelpers;

      const lat = 1.3537;
      const lng = 103.8060;

      // Step 1: Validate coordinate format
      const validation = validateCoordinates(lat, lng);
      expect(validation.isValid).toBe(true);

      // Step 2: Check if within Singapore bounds
      const isInSingapore = isValidSingaporeCoordinates(lat, lng);
      expect(isInSingapore).toBe(true);

      // Step 3: Format for display
      const formatted = formatCoordinates(lat, lng, 4);
      expect(formatted).toBe("1.3537, 103.8060");
    });

    test("parses and validates coordinate string", () => {
      const {
        parseCoordinates,
        validateCoordinates,
        isValidSingaporeCoordinates
      } = useLocationGeocodingHelpers;

      const coordString = "1.3537, 103.8060";

      // Step 1: Parse coordinate string
      const parsed = parseCoordinates(coordString);
      expect(parsed).not.toBeNull();

      if (parsed) {
        const [lat, lng] = parsed;

        // Step 2: Validate parsed coordinates
        const validation = validateCoordinates(lat, lng);
        expect(validation.isValid).toBe(true);

        // Step 3: Check Singapore bounds
        const isInSingapore = isValidSingaporeCoordinates(lat, lng);
        expect(isInSingapore).toBe(true);
      }
    });

    test("calculates distance between Singapore locations", () => {
      const {
        isValidSingaporeCoordinates,
        calculateDistance
      } = useLocationGeocodingHelpers;

      const cbd = [1.2966, 103.8520] as [number, number];
      const changi = [1.3644, 103.9915] as [number, number];

      // Verify both locations are in Singapore
      expect(isValidSingaporeCoordinates(cbd[0], cbd[1])).toBe(true);
      expect(isValidSingaporeCoordinates(changi[0], changi[1])).toBe(true);

      // Calculate distance
      const distance = calculateDistance(cbd[0], cbd[1], changi[0], changi[1]);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(50); // Should be less than 50km within Singapore
    });
  });
});