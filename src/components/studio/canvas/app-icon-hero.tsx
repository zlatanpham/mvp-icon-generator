'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { useDesign, type Design } from '@/lib/studio/design';
import { backgroundCss } from '@/lib/studio/render/background-css';
import { ensureFontLoaded, fontStack } from '@/lib/studio/data/fonts';
import { PatternOverlay } from '@/components/studio/overlays/pattern-overlay';
import { GrainOverlay } from '@/components/studio/overlays/grain-overlay';
import { SvgStorage } from '@/lib/svg-storage';
import type { UploadedSvg } from '@/lib/svg-processor';

type Props = {
  size?: number;
  radiusPct?: number;
  strokeWidth?: number;
  style?: CSSProperties;
  design?: Design;
  noShadow?: boolean;
  /**
   * Render only the foreground content (no background, overlays, or rounded
   * clip). Used by the splash preview where the icon should appear directly
   * over the splash background.
   */
  bare?: boolean;
};

export function AppIconHero({
  size = 320,
  radiusPct,
  strokeWidth = 1.6,
  style,
  design: overrideDesign,
  noShadow,
  bare,
}: Props) {
  const ctx = useDesign();
  const design = overrideDesign ?? ctx.design;
  const { bg, foreground, content, contentSize } = design;
  const radius = radiusPct ?? design.radius;

  useEffect(() => {
    if (content.mode === 'letters') {
      ensureFontLoaded(content.font, content.fontWeight);
    }
  }, [content.mode, content.font, content.fontWeight]);

  const contentLayer =
    content.mode === 'icon' ? (
      <IconLayer
        design={design}
        contentSize={contentSize}
        foreground={foreground}
        strokeWidth={strokeWidth}
      />
    ) : (
      <div
        className="relative z-[2] text-center leading-none"
        style={{
          color: foreground,
          fontFamily: fontStack(content.font),
          fontWeight: content.fontWeight,
          fontSize: `${size * (contentSize / 100) * 0.6}px`,
          letterSpacing: '-0.03em',
        }}
      >
        {content.letters || 'A'}
      </div>
    );

  if (bare) {
    return (
      <div
        className="relative grid place-items-center"
        style={{ width: size, height: size, ...style }}
      >
        {contentLayer}
      </div>
    );
  }

  return (
    <div
      className={`relative grid place-items-center overflow-hidden transition-[border-radius] duration-200 ${
        noShadow ? '' : 'shadow-lifted'
      }`}
      style={{
        width: size,
        height: size,
        borderRadius: `${radius}%`,
        background: backgroundCss(bg),
        ...style,
      }}
    >
      <PatternOverlay
        pattern={bg.pattern}
        color={bg.patternColor}
        opacity={bg.patternOpacity}
      />
      <GrainOverlay amount={bg.grain} />
      {contentLayer}
    </div>
  );
}

function IconLayer({
  design,
  contentSize,
  foreground,
  strokeWidth,
}: {
  design: Design;
  contentSize: number;
  foreground: string;
  strokeWidth: number;
}) {
  const { content } = design;
  const innerStyle: CSSProperties = {
    width: `${contentSize}%`,
    height: `${contentSize}%`,
  };

  if (content.iconSource === 'uploaded') {
    return (
      <UploadedIconLayer
        uploadedId={content.uploadedSvgId}
        foreground={foreground}
        style={innerStyle}
      />
    );
  }

  if (content.iconSource === 'lucide') {
    return (
      <LucideIconLayer
        iconName={content.iconId}
        foreground={foreground}
        filled={content.filled}
        strokeWidth={strokeWidth}
        style={innerStyle}
      />
    );
  }

  return (
    <div className="relative z-[2] grid place-items-center" style={innerStyle}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={foreground}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-full w-full"
      >
        <path
          d={content.iconPath ?? ''}
          fill={content.filled ? foreground : 'none'}
        />
      </svg>
    </div>
  );
}

function LucideIconLayer({
  iconName,
  foreground,
  filled,
  strokeWidth,
  style,
}: {
  iconName: string;
  foreground: string;
  filled: boolean;
  strokeWidth: number;
  style: CSSProperties;
}) {
  const [Icon, setIcon] = useState<React.ComponentType<{
    color?: string;
    strokeWidth?: number;
    fill?: string;
    className?: string;
  }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('lucide-react').then(mod => {
      if (cancelled) return;
      const map = (mod as unknown as { icons: Record<string, unknown> }).icons;
      const found = map?.[iconName];
      if (found) {
        setIcon(
          () =>
            found as React.ComponentType<{
              color?: string;
              strokeWidth?: number;
              fill?: string;
              className?: string;
            }>,
        );
      } else {
        setIcon(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [iconName]);

  return (
    <div className="relative z-[2] grid place-items-center" style={style}>
      {Icon ? (
        <Icon
          color={foreground}
          strokeWidth={strokeWidth}
          fill={filled ? foreground : 'none'}
          className="h-full w-full"
        />
      ) : null}
    </div>
  );
}

function UploadedIconLayer({
  uploadedId,
  foreground,
  style,
}: {
  uploadedId?: string;
  foreground: string;
  style: CSSProperties;
}) {
  const [svg, setSvg] = useState<UploadedSvg | null>(null);

  useEffect(() => {
    // SvgStorage reads sessionStorage which only exists on the client, so we
    // load on mount/prop-change rather than during render to avoid SSR
    // hydration mismatches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSvg(
      uploadedId
        ? (SvgStorage.loadUploadedSvgs().find(s => s.id === uploadedId) ?? null)
        : null,
    );
  }, [uploadedId]);

  if (!svg) return null;

  const tinted = svg.sanitizedSvg
    .replace(/fill="(?!none)[^"]*"/gi, 'fill="currentColor"')
    .replace(/stroke="(?!none)[^"]*"/gi, 'stroke="currentColor"')
    .replace(
      /<path(?![^>]*(?:fill|stroke)="[^"]*")([^>]*)>/gi,
      '<path$1 fill="currentColor">',
    )
    .replace(
      /<(circle|ellipse|rect|polygon|polyline)(?![^>]*(?:fill|stroke)="[^"]*")([^>]*)>/gi,
      '<$1$2 fill="currentColor">',
    )
    .replace(/(width|height)="[^"]*"/gi, '');

  return (
    <div
      className="relative z-[2] grid place-items-center"
      style={{ ...style, color: foreground }}
      dangerouslySetInnerHTML={{ __html: tinted }}
    />
  );
}
