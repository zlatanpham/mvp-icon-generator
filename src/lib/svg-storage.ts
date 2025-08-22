import { UploadedSvg } from './svg-processor';

export class SvgStorage {
  private static readonly STORAGE_KEY = 'mvp-icon-generator-uploaded-svgs';
  private static readonly MAX_STORED_SVGS = 10;

  static saveUploadedSvgs(svgs: UploadedSvg[]): void {
    try {
      // Limit the number of stored SVGs
      const svgsToStore = svgs.slice(0, this.MAX_STORED_SVGS);

      // Convert to storage format (exclude the DOM element as it can't be serialized)
      const storageData = svgsToStore.map(svg => ({
        id: svg.id,
        name: svg.name,
        originalName: svg.originalName,
        sanitizedSvg: svg.sanitizedSvg,
        uploadedAt: svg.uploadedAt.toISOString(),
        fileSize: svg.fileSize,
      }));

      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save uploaded SVGs to storage:', error);
    }
  }

  static loadUploadedSvgs(): UploadedSvg[] {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const storageData = JSON.parse(stored) as Array<{
        id: string;
        name: string;
        originalName: string;
        sanitizedSvg: string;
        uploadedAt: string;
        fileSize: number;
      }>;

      // Convert back to UploadedSvg format (recreate DOM elements)
      return storageData.map(item => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(item.sanitizedSvg, 'image/svg+xml');
        const svgElement = doc.documentElement.cloneNode(true) as SVGElement;

        return {
          id: item.id,
          name: item.name,
          originalName: item.originalName,
          sanitizedSvg: item.sanitizedSvg,
          svgElement,
          uploadedAt: new Date(item.uploadedAt),
          fileSize: item.fileSize,
        };
      });
    } catch (error) {
      console.error('Failed to load uploaded SVGs from storage:', error);
      return [];
    }
  }

  static removeUploadedSvg(
    svgId: string,
    currentSvgs: UploadedSvg[],
  ): UploadedSvg[] {
    const updatedSvgs = currentSvgs.filter(svg => svg.id !== svgId);
    this.saveUploadedSvgs(updatedSvgs);
    return updatedSvgs;
  }

  static clearAllUploadedSvgs(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear uploaded SVGs from storage:', error);
    }
  }

  static getStorageUsage(): { used: number; available: number } {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      const used = stored ? new Blob([stored]).size : 0;

      // Estimate available sessionStorage (most browsers allow ~5-10MB)
      const estimated = 5 * 1024 * 1024; // 5MB estimate

      return {
        used,
        available: Math.max(0, estimated - used),
      };
    } catch {
      return { used: 0, available: 0 };
    }
  }
}
