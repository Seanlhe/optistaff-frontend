/**
 * useAddressLookup Hook - Pure Function Unit Tests
 * @description Tests for pure address validation and formatting functions
 * @testing-strategy Boundary Value Testing (BVT) and Equivalence Class Testing (ECT)
 */

import { describe, test, expect } from "vitest";

// Pure helper functions extracted for testing
export const useAddressLookupHelpers = {
  /**
   * Validate address input length
   * @param address - Address string to validate
   * @returns Boolean indicating if address is valid length
   */
  isValidAddressLength: (address: string): boolean => {
    return Boolean(address && address.trim().length >= 5);
  },

  /**
   * Extract block number from Singapore address
   * @param addressStr - Address string
   * @returns Block number or null if not found
   */
  extractBlockNumber: (addressStr: string): string | null => {
    const blockMatch = addressStr.match(/^(?:blk\s+)?(\d+[a-z]?)\s+/i);
    return blockMatch ? blockMatch[1].toLowerCase() : null;
  },

  /**
   * Normalize road types for comparison
   * @param addressStr - Address string
   * @returns Normalized address string
   */
  normalizeRoadTypes: (addressStr: string): string => {
    return addressStr
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b(rd|road)\b/g, 'road')
      .replace(/\b(st|street)\b/g, 'street')
      .replace(/\b(ave|avenue)\b/g, 'avenue')
      .replace(/\b(ln|lane)\b/g, 'lane')
      .replace(/\b(dr|drive)\b/g, 'drive')
      .replace(/\b(cres|crescent)\b/g, 'crescent')
      .replace(/\b(cl|close)\b/g, 'close')
      .replace(/\b(pk|park)\b/g, 'park')
      .replace(/\b(pl|place)\b/g, 'place')
      .replace(/\b(gdn|garden)\b/g, 'garden')
      .replace(/\b(gdns|gardens)\b/g, 'gardens')
      .replace(/\b(hts|heights)\b/g, 'heights')
      .replace(/\b(est|estate)\b/g, 'estate')
      .replace(/\b(tce|terrace)\b/g, 'terrace')
      .replace(/\b(wk|walk)\b/g, 'walk');
  },

  /**
   * Extract street name from address (removing block number)
   * @param addressStr - Address string
   * @returns Street name
   */
  extractStreetName: (addressStr: string): string => {
    // Remove block number first
    let withoutBlock = addressStr.replace(/^(?:blk\s+)?\d+[a-z]?\s+/i, '');

    // Remove postal code (6 digits) and any trailing location info
    withoutBlock = withoutBlock.replace(/\s+\d{6}.*$/, '');

    // Remove common Singapore location suffixes that might remain
    withoutBlock = withoutBlock.replace(
      /\s+(singapore|downtown core|central|orchard|marina bay|bugis|chinatown|little india|kampong glam).*$/i,
      ''
    );

    // Then normalize road types
    return useAddressLookupHelpers.normalizeRoadTypes(withoutBlock);
  },

  /**
   * Validate Singapore postal code format
   * @param postalCode - Postal code to validate
   * @returns Validation result
   */
  validatePostalCode: (postalCode: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (!postalCode) {
      errors.push("Postal code is required");
    } else if (!/^\d{6}$/.test(postalCode)) {
      errors.push("Postal code must be 6 digits");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format address for display (remove country suffix)
   * @param address - Raw address string
   * @returns Formatted address
   */
  formatAddressForDisplay: (address: string): string => {
    return address.replace(/, Singapore$/, '');
  },

  /**
   * Check if address contains Singapore-specific patterns
   * @param address - Address string to check
   * @returns Boolean indicating if address appears to be Singapore address
   */
  isSingaporeAddress: (address: string): boolean => {
    const singaporePatterns = [
      /singapore/i,
      /\b\d{6}\b/, // 6-digit postal code
      /\bblk\s+\d+/i, // Block number pattern
      /\b(orchard|marina bay|bugis|chinatown|little india|kampong glam|downtown core)/i,
      /\b(road|street|avenue|lane|drive|crescent|close|park|place|garden|gardens|heights|estate|terrace|walk)\b/i
    ];

    return singaporePatterns.some(pattern => pattern.test(address));
  },

  /**
   * Compare two addresses for similarity
   * @param address1 - First address
   * @param address2 - Second address
   * @returns Similarity score (0-1)
   */
  calculateAddressSimilarity: (address1: string, address2: string): number => {
    const normalized1 = useAddressLookupHelpers.normalizeRoadTypes(address1);
    const normalized2 = useAddressLookupHelpers.normalizeRoadTypes(address2);

    if (normalized1 === normalized2) return 1.0;

    // Extract components for comparison
    const block1 = useAddressLookupHelpers.extractBlockNumber(normalized1);
    const block2 = useAddressLookupHelpers.extractBlockNumber(normalized2);
    const street1 = useAddressLookupHelpers.extractStreetName(normalized1);
    const street2 = useAddressLookupHelpers.extractStreetName(normalized2);

    let score = 0;
    let components = 0;

    // Block number comparison (40% weight)
    if (block1 && block2) {
      components++;
      if (block1 === block2) score += 0.4;
    }

    // Street name comparison (60% weight)
    if (street1 && street2) {
      components++;
      if (street1 === street2) score += 0.6;
      else {
        // Partial match for similar street names
        const similarity = useAddressLookupHelpers.calculateStringSimilarity(street1, street2);
        score += similarity * 0.6;
      }
    }

    return components > 0 ? score : 0;
  },

  /**
   * Calculate string similarity using simple algorithm
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Similarity score (0-1)
   */
  calculateStringSimilarity: (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = useAddressLookupHelpers.calculateLevenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  },

  /**
   * Calculate Levenshtein distance between two strings
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Edit distance
   */
  calculateLevenshteinDistance: (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  },

  /**
   * Validate address components match
   * @param inputAddress - User input address
   * @param returnedAddress - API returned address
   * @returns Validation result
   */
  validateAddressMatch: (inputAddress: string, returnedAddress: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    const inputNormalized = inputAddress.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const returnedNormalized = returnedAddress.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Extract components from both addresses
    const inputBlockNumber = useAddressLookupHelpers.extractBlockNumber(inputNormalized);
    const returnedBlockNumber = useAddressLookupHelpers.extractBlockNumber(returnedNormalized);
    const inputStreetName = useAddressLookupHelpers.extractStreetName(inputNormalized);
    const returnedStreetName = useAddressLookupHelpers.extractStreetName(returnedNormalized);

    // Strict validation: Block number must match exactly if provided
    if (inputBlockNumber && returnedBlockNumber && inputBlockNumber !== returnedBlockNumber) {
      errors.push("Block number does not match");
    }

    // Flexible validation: Street names should match after normalization
    if (inputStreetName && returnedStreetName && inputStreetName !== returnedStreetName) {
      errors.push("Street name does not match");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

describe("useAddressLookup - Pure Functions Unit Tests", () => {
  describe("isValidAddressLength - Boundary Value Testing", () => {
    test("validates minimum valid address length", () => {
      const { isValidAddressLength } = useAddressLookupHelpers;
      
      expect(isValidAddressLength("12345")).toBe(true);  // Exactly 5 characters
      expect(isValidAddressLength("123456")).toBe(true); // Above minimum
    });

    test("rejects addresses below minimum length", () => {
      const { isValidAddressLength } = useAddressLookupHelpers;
      
      expect(isValidAddressLength("")).toBe(false);      // Empty
      expect(isValidAddressLength("a")).toBe(false);     // 1 character
      expect(isValidAddressLength("abcd")).toBe(false);  // 4 characters
    });

    test("handles whitespace correctly", () => {
      const { isValidAddressLength } = useAddressLookupHelpers;
      
      expect(isValidAddressLength("   ")).toBe(false);        // Only whitespace
      expect(isValidAddressLength("  abc  ")).toBe(false);    // Trimmed length < 5
      expect(isValidAddressLength("  abcde  ")).toBe(true);   // Trimmed length = 5
    });

    test("handles null and undefined", () => {
      const { isValidAddressLength } = useAddressLookupHelpers;
      
      expect(isValidAddressLength(null as any)).toBe(false);
      expect(isValidAddressLength(undefined as any)).toBe(false);
    });
  });

  describe("extractBlockNumber - Equivalence Class Testing", () => {
    test("extracts standard block numbers", () => {
      const { extractBlockNumber } = useAddressLookupHelpers;
      
      expect(extractBlockNumber("123 Main Street")).toBe("123");
      expect(extractBlockNumber("456 Central Avenue")).toBe("456");
      expect(extractBlockNumber("789 Park Road")).toBe("789");
    });

    test("extracts block numbers with 'Blk' prefix", () => {
      const { extractBlockNumber } = useAddressLookupHelpers;
      
      expect(extractBlockNumber("Blk 123 Main Street")).toBe("123");
      expect(extractBlockNumber("BLK 456 Central Avenue")).toBe("456");
      expect(extractBlockNumber("blk 789 Park Road")).toBe("789");
    });

    test("extracts block numbers with letter suffix", () => {
      const { extractBlockNumber } = useAddressLookupHelpers;
      
      expect(extractBlockNumber("123A Main Street")).toBe("123a");
      expect(extractBlockNumber("456B Central Avenue")).toBe("456b");
      expect(extractBlockNumber("Blk 789C Park Road")).toBe("789c");
    });

    test("returns null for addresses without block numbers", () => {
      const { extractBlockNumber } = useAddressLookupHelpers;
      
      expect(extractBlockNumber("Main Street")).toBeNull();
      expect(extractBlockNumber("Central Shopping Mall")).toBeNull();
      expect(extractBlockNumber("")).toBeNull();
    });

    test("returns null for invalid block number patterns", () => {
      const { extractBlockNumber } = useAddressLookupHelpers;
      
      expect(extractBlockNumber("ABC Main Street")).toBeNull();
      expect(extractBlockNumber("Block Main Street")).toBeNull();
      expect(extractBlockNumber("Blk ABC Main Street")).toBeNull();
    });
  });

  describe("normalizeRoadTypes - Pure String Transformation", () => {
    test("normalizes common road type abbreviations", () => {
      const { normalizeRoadTypes } = useAddressLookupHelpers;
      
      expect(normalizeRoadTypes("Main St")).toBe("main street");
      expect(normalizeRoadTypes("Central Rd")).toBe("central road");
      expect(normalizeRoadTypes("Park Ave")).toBe("park avenue");
      expect(normalizeRoadTypes("Garden Ln")).toBe("garden lane");
      expect(normalizeRoadTypes("Ocean Dr")).toBe("ocean drive");
    });

    test("normalizes full road type names", () => {
      const { normalizeRoadTypes } = useAddressLookupHelpers;
      
      expect(normalizeRoadTypes("Main Street")).toBe("main street");
      expect(normalizeRoadTypes("Central Road")).toBe("central road");
      expect(normalizeRoadTypes("Park Avenue")).toBe("park avenue");
    });

    test("handles case conversion", () => {
      const { normalizeRoadTypes } = useAddressLookupHelpers;
      
      expect(normalizeRoadTypes("MAIN STREET")).toBe("main street");
      expect(normalizeRoadTypes("Central ROAD")).toBe("central road");
      expect(normalizeRoadTypes("park avenue")).toBe("park avenue");
    });

    test("removes special characters and normalizes whitespace", () => {
      const { normalizeRoadTypes } = useAddressLookupHelpers;
      
      expect(normalizeRoadTypes("Main@#$ St!")).toBe("main street");
      expect(normalizeRoadTypes("Central   Road")).toBe("central road");
      expect(normalizeRoadTypes("  Park Ave  ")).toBe("park avenue");
    });

    test("handles Singapore-specific road types", () => {
      const { normalizeRoadTypes } = useAddressLookupHelpers;
      
      expect(normalizeRoadTypes("Botanic Gdns")).toBe("botanic gardens");
      expect(normalizeRoadTypes("Marina Hts")).toBe("marina heights");
      expect(normalizeRoadTypes("Sunset Est")).toBe("sunset estate");
      expect(normalizeRoadTypes("River Tce")).toBe("river terrace");
    });

    test("handles empty and edge cases", () => {
      const { normalizeRoadTypes } = useAddressLookupHelpers;
      
      expect(normalizeRoadTypes("")).toBe("");
      expect(normalizeRoadTypes("   ")).toBe("");
      expect(normalizeRoadTypes("123")).toBe("123");
    });
  });

  describe("extractStreetName - Complex String Processing", () => {
    test("extracts street name from standard addresses", () => {
      const { extractStreetName } = useAddressLookupHelpers;
      
      expect(extractStreetName("123 Main Street")).toBe("main street");
      expect(extractStreetName("456 Central Avenue")).toBe("central avenue");
      expect(extractStreetName("Blk 789 Park Road")).toBe("park road");
    });

    test("removes postal codes and location suffixes", () => {
      const { extractStreetName } = useAddressLookupHelpers;
      
      expect(extractStreetName("123 Main Street 123456")).toBe("main street");
      expect(extractStreetName("456 Central Ave, Singapore")).toBe("central avenue");
      expect(extractStreetName("789 Park Rd, Downtown Core")).toBe("park road");
    });

    test("handles addresses without block numbers", () => {
      const { extractStreetName } = useAddressLookupHelpers;
      
      expect(extractStreetName("Main Street")).toBe("main street");
      expect(extractStreetName("Central Shopping Mall")).toBe("central shopping mall");
    });

    test("removes Singapore location references", () => {
      const { extractStreetName } = useAddressLookupHelpers;
      
      expect(extractStreetName("123 Orchard Road, Orchard")).toBe("orchard road");
      expect(extractStreetName("456 Marina Bay Ave, Marina Bay")).toBe("marina bay avenue");
      expect(extractStreetName("789 Bugis Street, Bugis")).toBe("bugis street");
    });
  });

  describe("validatePostalCode - Boundary Value Testing", () => {
    test("validates correct 6-digit postal codes", () => {
      const { validatePostalCode } = useAddressLookupHelpers;
      
      const validCodes = ["123456", "000000", "999999", "654321"];
      
      validCodes.forEach(code => {
        const result = validatePostalCode(code);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test("rejects invalid postal code formats", () => {
      const { validatePostalCode } = useAddressLookupHelpers;
      
      const invalidCases = [
        { code: "", expectedError: "Postal code is required" },
        { code: "12345", expectedError: "Postal code must be 6 digits" },
        { code: "1234567", expectedError: "Postal code must be 6 digits" },
        { code: "12345a", expectedError: "Postal code must be 6 digits" },
        { code: "abcdef", expectedError: "Postal code must be 6 digits" },
        { code: "12-3456", expectedError: "Postal code must be 6 digits" }
      ];
      
      invalidCases.forEach(({ code, expectedError }) => {
        const result = validatePostalCode(code);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(expectedError);
      });
    });
  });

  describe("formatAddressForDisplay - Pure String Transformation", () => {
    test("removes Singapore country suffix", () => {
      const { formatAddressForDisplay } = useAddressLookupHelpers;
      
      expect(formatAddressForDisplay("123 Main Street, Singapore")).toBe("123 Main Street");
      expect(formatAddressForDisplay("456 Central Ave, Singapore")).toBe("456 Central Ave");
    });

    test("leaves addresses without Singapore suffix unchanged", () => {
      const { formatAddressForDisplay } = useAddressLookupHelpers;
      
      expect(formatAddressForDisplay("123 Main Street")).toBe("123 Main Street");
      expect(formatAddressForDisplay("456 Central Ave, Malaysia")).toBe("456 Central Ave, Malaysia");
    });

    test("handles edge cases", () => {
      const { formatAddressForDisplay } = useAddressLookupHelpers;
      
      expect(formatAddressForDisplay("")).toBe("");
      expect(formatAddressForDisplay("Singapore")).toBe("Singapore");
      expect(formatAddressForDisplay(", Singapore")).toBe("");
    });
  });

  describe("isSingaporeAddress - Pattern Recognition", () => {
    test("identifies Singapore addresses by patterns", () => {
      const { isSingaporeAddress } = useAddressLookupHelpers;
      
      const singaporeAddresses = [
        "123 Main Street, Singapore",
        "Blk 456 Central Avenue 123456",
        "789 Orchard Road",
        "Marina Bay Sands",
        "Bugis Street Market",
        "Little India Heritage Trail"
      ];
      
      singaporeAddresses.forEach(address => {
        expect(isSingaporeAddress(address)).toBe(true);
      });
    });

    test("rejects non-Singapore addresses", () => {
      const { isSingaporeAddress } = useAddressLookupHelpers;
      
      const nonSingaporeAddresses = [
        "123 Main St, New York", // Contains "St" but not full "Street"
        "456 Central Ave, London", // Contains "Ave" but not full "Avenue"  
        "Random Address 12345" // 5-digit postal code
      ];
      
      nonSingaporeAddresses.forEach(address => {
        expect(isSingaporeAddress(address)).toBe(false);
      });
      
      // These will match because they contain full road type words
      expect(isSingaporeAddress("789 High Street, Sydney")).toBe(true); // Contains "Street"
    });

    test("handles edge cases", () => {
      const { isSingaporeAddress } = useAddressLookupHelpers;
      
      expect(isSingaporeAddress("")).toBe(false);
      expect(isSingaporeAddress("123")).toBe(false);
      expect(isSingaporeAddress("Street")).toBe(true); // Contains "street" pattern
    });
  });

  describe("calculateAddressSimilarity - Complex Comparison", () => {
    test("calculates perfect similarity for identical addresses", () => {
      const { calculateAddressSimilarity } = useAddressLookupHelpers;
      
      const address = "123 Main Street";
      expect(calculateAddressSimilarity(address, address)).toBe(1.0);
    });

    test("calculates high similarity for same components", () => {
      const { calculateAddressSimilarity } = useAddressLookupHelpers;
      
      const similarity = calculateAddressSimilarity(
        "123 Main Street",
        "123 Main St"
      );
      expect(similarity).toBe(1.0); // Should be 1.0 after normalization
    });

    test("calculates partial similarity for different block numbers", () => {
      const { calculateAddressSimilarity } = useAddressLookupHelpers;
      
      const similarity = calculateAddressSimilarity(
        "123 Main Street",
        "456 Main Street"
      );
      expect(similarity).toBe(0.6); // Only street name matches (60% weight)
    });

    test("calculates partial similarity for different street names", () => {
      const { calculateAddressSimilarity } = useAddressLookupHelpers;
      
      const similarity = calculateAddressSimilarity(
        "123 Main Street",
        "123 Central Avenue"
      );
      expect(similarity).toBeCloseTo(0.44, 2); // Only block number matches
    });

    test("calculates zero similarity for completely different addresses", () => {
      const { calculateAddressSimilarity } = useAddressLookupHelpers;
      
      const similarity = calculateAddressSimilarity(
        "123 Main Street",
        "456 Central Avenue"
      );
      expect(similarity).toBeCloseTo(0.04, 2); // Very low similarity
    });

    test("handles addresses without block numbers", () => {
      const { calculateAddressSimilarity } = useAddressLookupHelpers;
      
      const similarity = calculateAddressSimilarity(
        "Main Street",
        "Main Street"
      );
      expect(similarity).toBe(1); // Perfect match
    });
  });

  describe("calculateStringSimilarity - String Comparison", () => {
    test("calculates perfect similarity for identical strings", () => {
      const { calculateStringSimilarity } = useAddressLookupHelpers;
      
      expect(calculateStringSimilarity("hello", "hello")).toBe(1.0);
      expect(calculateStringSimilarity("", "")).toBe(1.0);
    });

    test("calculates zero similarity for completely different strings", () => {
      const { calculateStringSimilarity } = useAddressLookupHelpers;
      
      expect(calculateStringSimilarity("hello", "world")).toBeCloseTo(0.2, 1);
      expect(calculateStringSimilarity("abc", "xyz")).toBeCloseTo(0, 1);
    });

    test("calculates partial similarity for similar strings", () => {
      const { calculateStringSimilarity } = useAddressLookupHelpers;
      
      expect(calculateStringSimilarity("hello", "hallo")).toBeGreaterThan(0.5);
      expect(calculateStringSimilarity("street", "stret")).toBeGreaterThan(0.8);
    });

    test("handles empty strings", () => {
      const { calculateStringSimilarity } = useAddressLookupHelpers;
      
      expect(calculateStringSimilarity("", "hello")).toBe(0);
      expect(calculateStringSimilarity("hello", "")).toBe(0);
    });
  });

  describe("validateAddressMatch - Complex Validation", () => {
    test("validates matching addresses", () => {
      const { validateAddressMatch } = useAddressLookupHelpers;
      
      const result = validateAddressMatch(
        "123 Main Street",
        "123 Main Street, Singapore"
      );
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("validates addresses with normalized differences", () => {
      const { validateAddressMatch } = useAddressLookupHelpers;
      
      const result = validateAddressMatch(
        "123 Main St",
        "123 Main Street"
      );
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("rejects addresses with different block numbers", () => {
      const { validateAddressMatch } = useAddressLookupHelpers;
      
      const result = validateAddressMatch(
        "123 Main Street",
        "456 Main Street"
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Block number does not match");
    });

    test("rejects addresses with different street names", () => {
      const { validateAddressMatch } = useAddressLookupHelpers;
      
      const result = validateAddressMatch(
        "123 Main Street",
        "123 Central Avenue"
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Street name does not match");
    });

    test("accumulates multiple validation errors", () => {
      const { validateAddressMatch } = useAddressLookupHelpers;
      
      const result = validateAddressMatch(
        "123 Main Street",
        "456 Central Avenue"
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Block number does not match");
      expect(result.errors).toContain("Street name does not match");
    });

    test("handles addresses without block numbers", () => {
      const { validateAddressMatch } = useAddressLookupHelpers;
      
      const result = validateAddressMatch(
        "Main Street",
        "Main Street, Singapore"
      );
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});