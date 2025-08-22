import { describe, it, expect, beforeEach } from 'vitest';
import { SvgStorage } from '../svg-storage';
import { UploadedSvg } from '../svg-processor';

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Helper to create mock UploadedSvg
function createMockUploadedSvg(
  id: string = 'test-1',
  name: string = 'test',
): UploadedSvg {
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    '<svg viewBox="0 0 24 24"><path d="M12 2v20"/></svg>',
    'image/svg+xml',
  );

  return {
    id,
    name,
    originalName: `${name}.svg`,
    sanitizedSvg: '<svg viewBox="0 0 24 24"><path d="M12 2v20"/></svg>',
    svgElement: doc.documentElement.cloneNode(true) as SVGElement,
    uploadedAt: new Date(),
    fileSize: 100,
  };
}

describe('SvgStorage', () => {
  beforeEach(() => {
    mockSessionStorage.clear();
  });

  describe('saveUploadedSvgs', () => {
    it('should save single SVG to sessionStorage', () => {
      const svg = createMockUploadedSvg();

      SvgStorage.saveUploadedSvgs([svg]);

      const stored = mockSessionStorage.getItem(
        'mvp-icon-generator-uploaded-svgs',
      );
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(svg.id);
      expect(parsed[0].name).toBe(svg.name);
    });

    it('should limit stored SVGs to maximum of 10 (though we only use 1)', () => {
      const svgs = Array.from({ length: 15 }, (_, i) =>
        createMockUploadedSvg(`test-${i}`, `test-${i}`),
      );

      SvgStorage.saveUploadedSvgs(svgs);

      const stored = mockSessionStorage.getItem(
        'mvp-icon-generator-uploaded-svgs',
      );
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(10);
    });

    it('should handle storage errors gracefully', () => {
      // Mock setItem to throw an error
      const originalSetItem = mockSessionStorage.setItem;
      mockSessionStorage.setItem = () => {
        throw new Error('Storage full');
      };

      const svg = createMockUploadedSvg();

      // Should not throw
      expect(() => SvgStorage.saveUploadedSvgs([svg])).not.toThrow();

      // Restore original method
      mockSessionStorage.setItem = originalSetItem;
    });
  });

  describe('loadUploadedSvgs', () => {
    it('should load empty array when no data exists', () => {
      const result = SvgStorage.loadUploadedSvgs();
      expect(result).toEqual([]);
    });

    it('should load and recreate SVG elements', () => {
      const svg = createMockUploadedSvg();
      SvgStorage.saveUploadedSvgs([svg]);

      const result = SvgStorage.loadUploadedSvgs();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(svg.id);
      expect(result[0].name).toBe(svg.name);
      expect(result[0].svgElement).toBeInstanceOf(Element);
      expect(result[0].svgElement.tagName).toBe('svg');
      expect(result[0].uploadedAt).toBeInstanceOf(Date);
    });

    it('should handle corrupted storage data gracefully', () => {
      mockSessionStorage.setItem(
        'mvp-icon-generator-uploaded-svgs',
        'invalid json',
      );

      const result = SvgStorage.loadUploadedSvgs();
      expect(result).toEqual([]);
    });
  });

  describe('clearAllUploadedSvgs', () => {
    it('should clear all stored SVGs', () => {
      const svg = createMockUploadedSvg();
      SvgStorage.saveUploadedSvgs([svg]);

      // Verify it's stored
      expect(SvgStorage.loadUploadedSvgs()).toHaveLength(1);

      // Clear and verify
      SvgStorage.clearAllUploadedSvgs();
      expect(SvgStorage.loadUploadedSvgs()).toHaveLength(0);
    });

    it('should handle storage errors gracefully', () => {
      // Mock removeItem to throw an error
      const originalRemoveItem = mockSessionStorage.removeItem;
      mockSessionStorage.removeItem = () => {
        throw new Error('Storage error');
      };

      // Should not throw
      expect(() => SvgStorage.clearAllUploadedSvgs()).not.toThrow();

      // Restore original method
      mockSessionStorage.removeItem = originalRemoveItem;
    });
  });

  describe('getStorageUsage', () => {
    it('should return storage usage information', () => {
      const result = SvgStorage.getStorageUsage();

      expect(result).toHaveProperty('used');
      expect(result).toHaveProperty('available');
      expect(typeof result.used).toBe('number');
      expect(typeof result.available).toBe('number');
    });

    it('should calculate used storage correctly', () => {
      const svg = createMockUploadedSvg();
      SvgStorage.saveUploadedSvgs([svg]);

      const result = SvgStorage.getStorageUsage();
      expect(result.used).toBeGreaterThan(0);
    });
  });
});
