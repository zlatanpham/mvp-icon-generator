import DOMPurify from 'dompurify';

export interface UploadedSvg {
  id: string;
  name: string;
  originalName: string;
  sanitizedSvg: string;
  svgElement: SVGElement;
  uploadedAt: Date;
  fileSize: number;
}

export interface SvgValidationResult {
  isValid: boolean;
  error?: string;
  svgElement?: SVGElement;
  sanitizedSvg?: string;
}

export class SvgProcessor {
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  private static readonly ALLOWED_MIME_TYPES = [
    'image/svg+xml',
    'text/xml',
    'application/xml',
  ];

  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size exceeds 2MB limit' };
    }

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.svg')) {
      return { isValid: false, error: 'File must have .svg extension' };
    }

    // Check MIME type (if available)
    if (file.type && !this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Must be SVG.' };
    }

    return { isValid: true };
  }

  static async processSvgFile(file: File): Promise<SvgValidationResult> {
    try {
      // First validate the file
      const fileValidation = this.validateFile(file);
      if (!fileValidation.isValid) {
        return { isValid: false, error: fileValidation.error };
      }

      // Read file content
      const svgContent = await this.readFileAsText(file);

      // Parse and validate SVG structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');

      // Check for parsing errors
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        return { isValid: false, error: 'Invalid SVG format - parsing failed' };
      }

      const svgElement = doc.documentElement;
      if (svgElement.tagName !== 'svg') {
        return {
          isValid: false,
          error: 'File does not contain valid SVG content',
        };
      }

      // Sanitize the SVG content
      const sanitizedSvg = this.sanitizeSvg(svgContent);
      if (!sanitizedSvg) {
        return { isValid: false, error: 'SVG content could not be sanitized' };
      }

      // Parse the sanitized SVG to get a clean element
      const sanitizedDoc = parser.parseFromString(
        sanitizedSvg,
        'image/svg+xml',
      );
      const sanitizedElement = sanitizedDoc.documentElement.cloneNode(
        true,
      ) as SVGElement;

      // Ensure viewBox exists
      this.ensureViewBox(sanitizedElement);
      return {
        isValid: true,
        svgElement: sanitizedElement,
        sanitizedSvg,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  private static sanitizeSvg(svgContent: string): string {
    // Configure DOMPurify for SVG sanitization
    const config = {
      USE_PROFILES: { svg: true, svgFilters: true },
      ALLOWED_TAGS: [
        'svg',
        'g',
        'path',
        'circle',
        'ellipse',
        'line',
        'rect',
        'polygon',
        'polyline',
        'text',
        'tspan',
        'defs',
        'use',
        'mask',
        'clipPath',
        'marker',
        'symbol',
        'linearGradient',
        'radialGradient',
        'stop',
        'pattern',
        'image',
      ],
      ALLOWED_ATTR: [
        'viewBox',
        'width',
        'height',
        'd',
        'cx',
        'cy',
        'r',
        'rx',
        'ry',
        'x',
        'y',
        'x1',
        'y1',
        'x2',
        'y2',
        'points',
        'fill',
        'stroke',
        'stroke-width',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-dasharray',
        'stroke-dashoffset',
        'opacity',
        'fill-opacity',
        'stroke-opacity',
        'transform',
        'id',
        'class',
        'clip-path',
        'mask',
        'marker-start',
        'marker-mid',
        'marker-end',
        'gradientUnits',
        'gradientTransform',
        'offset',
        'stop-color',
        'stop-opacity',
        'patternUnits',
        'patternTransform',
        'href',
        'xlink:href',
        'xmlns',
        'xmlns:xlink',
        'version',
        'xml:space',
        'enable-background',
        'style',
      ],
      FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
      FORBID_ATTR: [
        'onload',
        'onerror',
        'onclick',
        'onmouseover',
        'onmouseout',
        'onmousemove',
        'onfocus',
        'onblur',
      ],
      REMOVE_SCRIPTS: true,
      REMOVE_SCRIPT_TYPE_ATTRS: true,
      SANITIZE_DOM: true,
    };

    return DOMPurify.sanitize(svgContent, config);
  }

  private static ensureViewBox(svgElement: SVGElement): void {
    if (!svgElement.getAttribute('viewBox')) {
      const width = svgElement.getAttribute('width') || '24';
      const height = svgElement.getAttribute('height') || '24';

      // Remove unit suffixes and convert to numbers
      const w = parseFloat(width.replace(/[^\d.-]/g, '')) || 24;
      const h = parseFloat(height.replace(/[^\d.-]/g, '')) || 24;

      svgElement.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }
  }

  static createUploadedSvg(
    file: File,
    validationResult: SvgValidationResult,
  ): UploadedSvg {
    if (
      !validationResult.isValid ||
      !validationResult.svgElement ||
      !validationResult.sanitizedSvg
    ) {
      throw new Error(
        'Cannot create uploaded SVG from invalid validation result',
      );
    }

    return {
      id: `uploaded-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name.replace(/\.svg$/i, ''),
      originalName: file.name,
      sanitizedSvg: validationResult.sanitizedSvg,
      svgElement: validationResult.svgElement,
      uploadedAt: new Date(),
      fileSize: file.size,
    };
  }

  static getSvgElement(uploadedSvg: UploadedSvg): SVGElement {
    // Clone the element to avoid mutations affecting the stored version
    return uploadedSvg.svgElement.cloneNode(true) as SVGElement;
  }
}
