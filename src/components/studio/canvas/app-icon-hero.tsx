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
  /** Visual size in px the icon should render at (the wrapper). */
  size?: number;
  /** Optional radius override (defaults to design.radius). */
  radiusPct?: number;
  /** Optional foreground stroke width override (used by smaller previews). */
  strokeWidth?: number;
  /** Inline style on the wrapper (e.g. transform for zoom). */
  style?: CSSProperties;
  /** Override design (for previews like phone/browser that pass static design). */
  design?: Design;
  /** Disable the soft drop shadow (used inside frames). */
  noShadow?: boolean;
};

export function AppIconHero({
  size = 320,
  radiusPct,
  strokeWidth = 1.6,
  style,
  design: overrideDesign,
  noShadow,
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

  return (
    <div
      className="relative grid place-items-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: `${radius}%`,
        background: backgroundCss(bg),
        boxShadow: noShadow
          ? undefined
          : '0 30px 60px rgba(21,20,15,0.20), 0 8px 20px rgba(21,20,15,0.10)',
        transition: 'border-radius .25s',
        ...style,
      }}
    >
      <PatternOverlay
        pattern={bg.pattern}
        color={bg.patternColor}
        opacity={bg.patternOpacity}
      />
      <GrainOverlay amount={bg.grain} />

      {content.mode === 'icon' ? (
        <IconLayer
          design={design}
          size={size}
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
      )}
    </div>
  );
}

function IconLayer({
  design,
  size,
  contentSize,
  foreground,
  strokeWidth,
}: {
  design: Design;
  size: number;
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

  // curated or lucide — both rendered as a single 24x24 SVG with a stroke or fill
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
    <div
      className="relative z-[2] grid place-items-center"
      style={innerStyle}
    >
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
  // Lazy import the icons map only on the client to avoid bundling all icons in SSR.
  const [Icon, setIcon] = useState<React.ComponentType<{
    color?: string;
    strokeWidth?: number;
    fill?: string;
    className?: string;
  }> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('lucide-react').then((mod) => {
      if (cancelled) return;
      const map = (mod as unknown as { icons: Record<string, unknown> }).icons;
      const found = map?.[iconName];
      if (found) {
        setIcon(() => found as React.ComponentType<{
          color?: string;
          strokeWidth?: number;
          fill?: string;
          className?: string;
        }>);
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
    if (!uploadedId) {
      setSvg(null);
      return;
    }
    const all = SvgStorage.loadUploadedSvgs();
    setSvg(all.find((s) => s.id === uploadedId) ?? null);
  }, [uploadedId]);

  if (!svg) return null;

  // Tint by replacing all explicit color attributes with currentColor and setting CSS color.
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
