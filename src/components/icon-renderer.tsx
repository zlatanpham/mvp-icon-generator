'use client';

import { CSSProperties, ComponentType } from 'react';
import { UploadedSvg } from '@/lib/svg-processor';

interface IconRendererProps {
  iconType: 'library' | 'uploaded';
  libraryIcon?: ComponentType<{
    style?: CSSProperties;
    className?: string;
    [key: string]: unknown;
  }>;
  uploadedSvg?: UploadedSvg;
  style?: CSSProperties;
  className?: string;
}

export default function IconRenderer({
  iconType,
  libraryIcon: LibraryIcon,
  uploadedSvg,
  style,
  className,
}: IconRendererProps) {
  if (iconType === 'uploaded' && uploadedSvg) {
    // Render uploaded SVG with proper centering and color application
    let svgHtml = uploadedSvg.sanitizedSvg;

    // Apply the icon color to the SVG by setting fill and stroke to currentColor
    // This ensures the SVG respects the icon color setting
    svgHtml = svgHtml
      // Set currentColor for all existing fill attributes (except 'none')
      .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
      // Set currentColor for all existing stroke attributes (except 'none')
      .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"')
      // Add fill="currentColor" to path elements that don't have fill or stroke
      .replace(
        /<path(?![^>]*(?:fill|stroke)="[^"]*")([^>]*)>/gi,
        '<path$1 fill="currentColor">',
      )
      // Add fill="currentColor" to other shape elements that don't have fill or stroke
      .replace(
        /<(circle|ellipse|rect|polygon|polyline)(?![^>]*(?:fill|stroke)="[^"]*")([^>]*)>/gi,
        '<$1$2 fill="currentColor">',
      )
      // Update the SVG element with proper styling and sizing
      .replace(
        /<svg([^>]*)>/i,
        `<svg$1 style="color: ${style?.color || 'currentColor'}; display: block; margin: auto;" class="${className || ''}">`,
      )
      // Remove any existing width/height from paths and shapes to allow CSS sizing
      .replace(/(width|height)="[^"]*"/gi, '');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: svgHtml }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: style?.width || '100%',
          height: style?.height || '100%',
          color: style?.color || 'currentColor',
        }}
        className={className}
      />
    );
  }

  if (iconType === 'library' && LibraryIcon) {
    // Render Lucide icon
    return <LibraryIcon style={style} className={className} />;
  }

  return null;
}
