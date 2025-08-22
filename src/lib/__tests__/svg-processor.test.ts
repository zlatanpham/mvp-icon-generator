import { describe, it, expect } from 'vitest';
import { SvgProcessor } from '../svg-processor';

// Create a mock File object for testing
function createMockSvgFile(content: string, name: string = 'test.svg'): File {
  const blob = new Blob([content], { type: 'image/svg+xml' });
  return new File([blob], name, { type: 'image/svg+xml' });
}

describe('SvgProcessor', () => {
  describe('validateFile', () => {
    it('should accept valid SVG files', () => {
      const file = createMockSvgFile('<svg></svg>', 'test.svg');
      const result = SvgProcessor.validateFile(file);
      expect(result.isValid).toBe(true);
    });

    it('should reject files without .svg extension', () => {
      const file = createMockSvgFile('<svg></svg>', 'test.png');
      const result = SvgProcessor.validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('svg extension');
    });

    it('should reject files larger than 2MB', () => {
      // Create a large mock file (3MB)
      const content = 'a'.repeat(3 * 1024 * 1024);
      const file = createMockSvgFile(content, 'large.svg');
      const result = SvgProcessor.validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('2MB limit');
    });
  });

  describe('processSvgFile', () => {
    it('should process a valid SVG file', async () => {
      const validSvg =
        '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      const file = createMockSvgFile(validSvg);

      const result = await SvgProcessor.processSvgFile(file);

      expect(result.isValid).toBe(true);
      expect(result.svgElement).toBeDefined();
      expect(result.sanitizedSvg).toBeDefined();
    });

    it('should reject invalid SVG content', async () => {
      const invalidSvg = '<not-svg>invalid content</not-svg>';
      const file = createMockSvgFile(invalidSvg);

      const result = await SvgProcessor.processSvgFile(file);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid SVG content');
    });

    it('should sanitize malicious SVG content', async () => {
      const maliciousSvg =
        '<svg viewBox="0 0 24 24" onload="alert(\'xss\')"><script>alert("xss")</script><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      const file = createMockSvgFile(maliciousSvg);

      const result = await SvgProcessor.processSvgFile(file);

      expect(result.isValid).toBe(true);
      expect(result.sanitizedSvg).not.toContain('onload');
      expect(result.sanitizedSvg).not.toContain('script');
    });

    it('should add viewBox if missing', async () => {
      const svgWithoutViewBox =
        '<svg width="24" height="24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      const file = createMockSvgFile(svgWithoutViewBox);

      const result = await SvgProcessor.processSvgFile(file);

      expect(result.isValid).toBe(true);
      expect(result.svgElement?.getAttribute('viewBox')).toBe('0 0 24 24');
    });
  });

  describe('createUploadedSvg', () => {
    it('should create UploadedSvg object from valid file and result', async () => {
      const validSvg =
        '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      const file = createMockSvgFile(validSvg, 'star.svg');
      const result = await SvgProcessor.processSvgFile(file);

      const uploadedSvg = SvgProcessor.createUploadedSvg(file, result);

      expect(uploadedSvg.name).toBe('star');
      expect(uploadedSvg.originalName).toBe('star.svg');
      expect(uploadedSvg.id).toContain('uploaded-');
      expect(uploadedSvg.fileSize).toBe(file.size);
      expect(uploadedSvg.svgElement).toBeDefined();
      expect(uploadedSvg.uploadedAt).toBeInstanceOf(Date);
    });
  });

  describe('getSvgElement', () => {
    it('should return a cloned SVG element', async () => {
      const validSvg =
        '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      const file = createMockSvgFile(validSvg);
      const result = await SvgProcessor.processSvgFile(file);
      const uploadedSvg = SvgProcessor.createUploadedSvg(file, result);

      const clonedElement = SvgProcessor.getSvgElement(uploadedSvg);

      expect(clonedElement).not.toBe(uploadedSvg.svgElement);
      expect(clonedElement.tagName).toBe('svg');
      expect(clonedElement.getAttribute('viewBox')).toBe('0 0 24 24');
    });
  });
});
