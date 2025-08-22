import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import IconRenderer from '../icon-renderer';
import { UploadedSvg } from '@/lib/svg-processor';

// Mock uploaded SVG with explicit colors
const mockUploadedSvg: UploadedSvg = {
  id: 'test-svg',
  name: 'test-icon',
  originalName: 'test-icon.svg',
  sanitizedSvg:
    '<svg viewBox="0 0 24 24"><path fill="#ff0000" stroke="#00ff00" d="M12 2v20"/></svg>',
  svgElement: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
  uploadedAt: new Date(),
  fileSize: 100,
};

// Mock uploaded SVG without colors (like napster.svg)
const mockUploadedSvgNoColors: UploadedSvg = {
  id: 'test-svg-no-colors',
  name: 'test-icon-no-colors',
  originalName: 'test-icon-no-colors.svg',
  sanitizedSvg:
    '<svg viewBox="0 0 24 24"><path d="M12 2v20"/><path d="M2 12h20"/></svg>',
  svgElement: document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
  uploadedAt: new Date(),
  fileSize: 100,
};

// Mock Lucide icon component
const MockLucideIcon = ({
  style,
  className,
}: {
  style?: React.CSSProperties;
  className?: string;
}) => (
  <svg style={style} className={className} viewBox="0 0 24 24">
    <path d="M12 2v20" />
  </svg>
);

describe('IconRenderer', () => {
  describe('uploaded SVG rendering', () => {
    it('should render uploaded SVG with color applied', () => {
      const { container } = render(
        <IconRenderer
          iconType="uploaded"
          uploadedSvg={mockUploadedSvg}
          style={{ color: '#0000ff' }}
        />,
      );

      const renderedDiv = container.firstChild as HTMLElement;
      expect(renderedDiv).toBeTruthy();
      expect(renderedDiv.style.color).toBe('rgb(0, 0, 255)'); // #0000ff in rgb
    });

    it('should apply currentColor to fill and stroke attributes', () => {
      const { container } = render(
        <IconRenderer
          iconType="uploaded"
          uploadedSvg={mockUploadedSvg}
          style={{ color: '#ff00ff' }}
        />,
      );

      const innerHTML = container.innerHTML;

      // Should replace original colors with currentColor
      expect(innerHTML).toContain('fill="currentColor"');
      expect(innerHTML).toContain('stroke="currentColor"');

      // Should not contain original colors
      expect(innerHTML).not.toContain('#ff0000');
      expect(innerHTML).not.toContain('#00ff00');
    });

    it('should preserve fill="none" and stroke="none"', () => {
      const svgWithNone: UploadedSvg = {
        ...mockUploadedSvg,
        sanitizedSvg:
          '<svg viewBox="0 0 24 24"><path fill="none" stroke="none" d="M12 2v20"/></svg>',
      };

      const { container } = render(
        <IconRenderer iconType="uploaded" uploadedSvg={svgWithNone} />,
      );

      const innerHTML = container.innerHTML;

      // Should preserve 'none' values
      expect(innerHTML).toContain('fill="none"');
      expect(innerHTML).toContain('stroke="none"');
    });

    it('should add fill="currentColor" to paths without fill or stroke', () => {
      const { container } = render(
        <IconRenderer
          iconType="uploaded"
          uploadedSvg={mockUploadedSvgNoColors}
          style={{ color: '#ff00ff' }}
        />,
      );

      const innerHTML = container.innerHTML;

      // Should add currentColor to paths without existing fill/stroke
      expect(innerHTML).toContain('fill="currentColor"');

      // Should have 2 paths with currentColor (both paths in the mock)
      const currentColorMatches = (
        innerHTML.match(/fill="currentColor"/g) || []
      ).length;
      expect(currentColorMatches).toBe(2);
    });

    it('should center the SVG with flex properties', () => {
      const { container } = render(
        <IconRenderer iconType="uploaded" uploadedSvg={mockUploadedSvg} />,
      );

      const renderedDiv = container.firstChild as HTMLElement;
      expect(renderedDiv.style.display).toBe('flex');
      expect(renderedDiv.style.alignItems).toBe('center');
      expect(renderedDiv.style.justifyContent).toBe('center');
    });
  });

  describe('library icon rendering', () => {
    it('should render library icon component', () => {
      const { container } = render(
        <IconRenderer
          iconType="library"
          libraryIcon={MockLucideIcon}
          style={{ color: '#00ff00' }}
        />,
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.style.color).toBe('rgb(0, 255, 0)'); // #00ff00 in rgb
    });
  });

  describe('edge cases', () => {
    it('should return null when no icon provided', () => {
      const { container } = render(<IconRenderer iconType="uploaded" />);

      expect(container.firstChild).toBeNull();
    });

    it('should return null when library icon type but no component', () => {
      const { container } = render(<IconRenderer iconType="library" />);

      expect(container.firstChild).toBeNull();
    });
  });
});
