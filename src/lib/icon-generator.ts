import JSZip from 'jszip';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  paintBackdrop,
  paintDesignToBlob,
  paintForegroundCentered,
  type PreparedForeground,
} from './studio/canvas-painter';
import type { Design } from './studio/design';
import { SvgStorage } from './svg-storage';
import { ensureFontLoaded } from './studio/data/fonts';

interface IconSize {
  name: string;
  size: number;
  purpose?: 'maskable';
}

interface SplashSize {
  name: string;
  width: number;
  height: number;
}

const ICON_SIZES: IconSize[] = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'icon-48x48.png', size: 48 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-256x256.png', size: 256 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-1024x1024.png', size: 1024 },
  { name: 'maskable-icon-192x192.png', size: 192, purpose: 'maskable' },
  { name: 'maskable-icon-512x512.png', size: 512, purpose: 'maskable' },
];

const SPLASH_SIZES: SplashSize[] = [
  { name: 'splash-1125x2436.png', width: 1125, height: 2436 },
  { name: 'splash-828x1792.png', width: 828, height: 1792 },
  { name: 'splash-1242x2688.png', width: 1242, height: 2688 },
  { name: 'splash-1080x2340.png', width: 1080, height: 2340 },
  { name: 'splash-1170x2532.png', width: 1170, height: 2532 },
  { name: 'splash-1284x2778.png', width: 1284, height: 2778 },
  { name: 'splash-1179x2556.png', width: 1179, height: 2556 },
  { name: 'splash-1290x2796.png', width: 1290, height: 2796 },
  { name: 'splash-1536x2048.png', width: 1536, height: 2048 },
  { name: 'splash-1668x2388.png', width: 1668, height: 2388 },
  { name: 'splash-2048x2732.png', width: 2048, height: 2732 },
];

// ============================================================================
// Public entry — Design-aware export
// ============================================================================

export async function generateDesignZip(design: Design): Promise<JSZip> {
  const zip = new JSZip();

  if (design.content.mode === 'letters') {
    ensureFontLoaded(design.content.font, design.content.fontWeight);
    if (typeof document !== 'undefined' && 'fonts' in document) {
      try {
        await document.fonts.load(
          `${design.content.fontWeight} 100px "${design.content.font}"`,
        );
      } catch {
        /* best-effort */
      }
    }
  }

  const fg = await prepareForeground(design);

  const pngBlobs: { size: number; blob: Blob }[] = [];
  for (const { name, size, purpose } of ICON_SIZES) {
    const radiusPct = purpose === 'maskable' ? 0 : design.radius;
    const contentSizePct =
      purpose === 'maskable'
        ? Math.min(80, design.contentSize)
        : design.contentSize;
    const blob = await paintDesignToBlob(design, fg, {
      size,
      radiusPct,
      contentSizePct,
    });
    pngBlobs.push({ size, blob });
    zip.file(name, blob);
  }

  for (const splash of SPLASH_SIZES) {
    const blob = await paintSplashScreen(design, fg, splash);
    zip.file(splash.name, blob);
  }

  zip.file('favicon.ico', favicon32(pngBlobs));

  const appName = design.name || 'App';
  const appShort = appName.length > 12 ? appName.slice(0, 12) : appName;
  zip.file(
    'manifest.json',
    generateManifest(design.bg.color, design.bg.color, appName, appShort),
  );
  zip.file('html-meta-tags.txt', generateHtmlMeta(design.bg.color, appName));
  zip.file('README.txt', generateReadme());

  return zip;
}

// ============================================================================
// Foreground preparation
// ============================================================================

async function prepareForeground(design: Design): Promise<PreparedForeground> {
  if (design.content.mode === 'letters') {
    return {
      kind: 'text',
      letters: design.content.letters || 'A',
      font: design.content.font,
      weight: design.content.fontWeight,
      color: design.foreground,
    };
  }

  const fg = design.foreground;
  switch (design.content.iconSource) {
    case 'curated':
      return {
        kind: 'svg',
        svgString: curatedSvgString(
          design.content.iconPath ?? '',
          fg,
          design.content.filled,
        ),
      };
    case 'lucide':
      return {
        kind: 'svg',
        svgString: await lucideSvgString(design.content.iconId, fg),
      };
    case 'uploaded': {
      const id = design.content.uploadedSvgId;
      if (!id) throw new Error('Missing uploaded SVG id');
      return {
        kind: 'svg',
        svgString: uploadedSvgString(id, fg),
      };
    }
  }
}

function curatedSvgString(path: string, fg: string, filled: boolean): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${fg}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${path}" fill="${filled ? fg : 'none'}"/></svg>`;
}

async function lucideSvgString(name: string, fg: string): Promise<string> {
  const mod = await import('lucide-react');
  const map = (
    mod as unknown as {
      icons: Record<
        string,
        React.ComponentType<{
          width?: number;
          height?: number;
          color?: string;
          strokeWidth?: number;
        }>
      >;
    }
  ).icons;
  const Comp = map[name];
  if (!Comp) throw new Error(`Lucide icon "${name}" not found`);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    await new Promise<void>(resolve => {
      root.render(
        createElement(Comp, {
          width: 24,
          height: 24,
          color: fg,
          strokeWidth: 1.6,
        }),
      );
      // Wait one frame for the component to mount.
      requestAnimationFrame(() => resolve());
    });
    const svgEl = container.querySelector('svg');
    if (!svgEl) throw new Error('Lucide render produced no <svg>');
    if (!svgEl.getAttribute('viewBox')) {
      svgEl.setAttribute('viewBox', '0 0 24 24');
    }
    svgEl.setAttribute('stroke', fg);
    svgEl.setAttribute('fill', 'none');
    svgEl.setAttribute('stroke-width', '1.6');
    svgEl.setAttribute('stroke-linecap', 'round');
    svgEl.setAttribute('stroke-linejoin', 'round');
    svgEl.querySelectorAll('*').forEach(el => {
      if (!(el instanceof SVGElement)) return;
      el.setAttribute('stroke', fg);
      if (!el.hasAttribute('stroke-width')) {
        el.setAttribute('stroke-width', '1.6');
      }
      const t = el.tagName.toLowerCase();
      if (
        t === 'path' ||
        t === 'circle' ||
        t === 'rect' ||
        t === 'polygon' ||
        t === 'polyline' ||
        t === 'ellipse' ||
        t === 'line'
      ) {
        el.setAttribute('fill', 'none');
      }
    });
    return new XMLSerializer().serializeToString(svgEl);
  } finally {
    root.unmount();
    container.remove();
  }
}

function uploadedSvgString(id: string, fg: string): string {
  const all = SvgStorage.loadUploadedSvgs();
  const item = all.find(s => s.id === id);
  if (!item) throw new Error('Uploaded SVG no longer in session');
  return item.sanitizedSvg
    .replace(/fill="(?!none)[^"]*"/gi, `fill="${fg}"`)
    .replace(/stroke="(?!none)[^"]*"/gi, `stroke="${fg}"`)
    .replace(
      /<path(?![^>]*(?:fill|stroke)="[^"]*")([^>]*)>/gi,
      `<path$1 fill="${fg}">`,
    )
    .replace(
      /<(circle|ellipse|rect|polygon|polyline)(?![^>]*(?:fill|stroke)="[^"]*")([^>]*)>/gi,
      `<$1$2 fill="${fg}">`,
    );
}

// ============================================================================
// Splash screen
// ============================================================================

async function paintSplashScreen(
  design: Design,
  fg: PreparedForeground,
  splash: SplashSize,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = splash.width;
  canvas.height = splash.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');

  // Paint the full designed backdrop (gradient + pattern + grain) so the
  // exported splash matches the on-screen preview.
  await paintBackdrop(ctx, design, splash.width, splash.height);

  // Paint the foreground content directly on the splash — no wrapping icon
  // tile, the content sits over the backdrop.
  const isPhone = splash.height > splash.width && splash.height > 1700;
  const min = Math.min(splash.width, splash.height);
  const slot = Math.round(min * 0.3 * (isPhone ? 1.5 : 1));

  const x = (splash.width - slot) / 2;
  const y = (splash.height - slot) / 2;
  ctx.save();
  ctx.translate(x, y);
  await paintForegroundCentered(ctx, fg, slot, design.contentSize);
  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(b => {
      if (b) resolve(b);
      else reject(new Error('Splash blob failed'));
    }, 'image/png');
  });
}

// ============================================================================
// favicon.ico (we keep the current behavior: 32x32 PNG bytes with .ico ext)
// ============================================================================

function favicon32(blobs: { size: number; blob: Blob }[]): Blob {
  const found = blobs.find(b => b.size === 32) ?? blobs[0];
  return found?.blob;
}

// ============================================================================
// manifest.json + html-meta-tags + README
// ============================================================================

export function generateManifest(
  backgroundColor: string,
  themeColor: string,
  appName: string,
  appShortName: string,
): string {
  return JSON.stringify(
    {
      name: appName,
      short_name: appShortName,
      icons: ICON_SIZES.filter(
        s =>
          !s.name.includes('favicon') &&
          !s.name.includes('apple') &&
          !s.name.includes('maskable'),
      )
        .map(({ name, size }) => ({
          src: `/${name}`,
          sizes: `${size}x${size}`,
          type: 'image/png',
        }))
        .concat(
          ICON_SIZES.filter(s => s.purpose === 'maskable').map(
            ({ name, size }) =>
              ({
                src: `/${name}`,
                sizes: `${size}x${size}`,
                type: 'image/png',
                purpose: 'maskable',
              }) as {
                src: string;
                sizes: string;
                type: string;
                purpose?: string;
              },
          ),
        ),
      theme_color: themeColor,
      background_color: backgroundColor,
      display: 'standalone',
      start_url: '/',
      scope: '/',
    },
    null,
    2,
  );
}

export function generateHtmlMeta(themeColor: string, appName: string): string {
  return `<!-- Primary Meta Tags -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android Chrome Icons -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color -->
<meta name="theme-color" content="${themeColor}">

<!-- iOS Safari PWA Configuration -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${appName}">

<!-- iOS Safari Splash Screens -->
<link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">
<link rel="apple-touch-startup-image" href="/splash-828x1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)">
<link rel="apple-touch-startup-image" href="/splash-1242x2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)">
<link rel="apple-touch-startup-image" href="/splash-1080x2340.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">
<link rel="apple-touch-startup-image" href="/splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)">
<link rel="apple-touch-startup-image" href="/splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)">
<link rel="apple-touch-startup-image" href="/splash-1179x2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)">
<link rel="apple-touch-startup-image" href="/splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)">
<link rel="apple-touch-startup-image" href="/splash-1536x2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)">
<link rel="apple-touch-startup-image" href="/splash-1668x2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)">
<link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)">`;
}

function generateReadme(): string {
  return `# Instant Icon — App Icons

Generated by Instant Icon App Icon Generator.

## Installation

1. Copy every PNG file to your public/ directory.
2. Copy the snippet from html-meta-tags.txt into your HTML <head>.
3. Copy manifest.json to public/ (your manifest already references it).

## Contents

- favicon-16x16.png, favicon-32x32.png, favicon.ico
- apple-touch-icon.png (180×180)
- android-chrome-192x192.png, android-chrome-512x512.png
- icon-48 → icon-1024 (PWA icon sizes)
- maskable-icon-192/512 (Android adaptive)
- splash-* (iOS Safari startup images for iPhone X → iPad Pro)
- manifest.json
- html-meta-tags.txt
`;
}
