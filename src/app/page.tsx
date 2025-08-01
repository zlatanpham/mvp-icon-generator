'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { icons } from 'lucide-react';
import { Search, Download } from 'lucide-react';
import { generateAllIcons } from '@/lib/icon-generator';
import { cn } from '@/lib/utils';

export default function Home() {
  const [selectedIcon, setSelectedIcon] = useState<string>('Atom');
  const [backgroundColor, setBackgroundColor] = useState('#0029ff');
  const [iconColor, setIconColor] = useState('#ffffff');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [borderRadius, setBorderRadius] = useState([20]); // 20% default
  const [iconSize, setIconSize] = useState([60]); // 60% default (40% padding total)

  // Get all icon names and filter based on search
  const iconNames = Object.keys(icons);

  const filteredIcons = iconNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Validate selected icon exists on component mount
  useEffect(() => {
    if (!icons[selectedIcon as keyof typeof icons]) {
      setSelectedIcon('package'); // Fallback to package if atom doesn't exist
    }
  }, [selectedIcon]);

  // Ensure the selected icon exists, fallback to 'package' if not found
  const IconComponent =
    icons[selectedIcon as keyof typeof icons] ||
    icons['package' as keyof typeof icons];

  const handleDownload = async () => {
    if (!IconComponent) return;

    setIsGenerating(true);
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      document.body.appendChild(container);

      const iconElement = document.createElement('div');
      container.appendChild(iconElement);

      const { createRoot } = await import('react-dom/client');
      const root = createRoot(iconElement);

      await new Promise<void>(resolve => {
        root.render(
          <IconComponent width={24} height={24} onLoad={() => resolve()} />,
        );
        setTimeout(resolve, 100);
      });

      const svgElement = iconElement.querySelector('svg');
      if (!svgElement) {
        throw new Error('Failed to find SVG element');
      }

      if (!svgElement.getAttribute('viewBox')) {
        svgElement.setAttribute('viewBox', '0 0 24 24');
      }

      const zip = await generateAllIcons(
        svgElement,
        backgroundColor,
        iconColor,
        borderRadius[0] / 100, // Convert percentage to decimal
        (100 - iconSize[0]) / 200, // Convert icon size to padding ratio
      );

      const blob = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pwa-icons-${selectedIcon}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      root.unmount();
      document.body.removeChild(container);
    } catch (error) {
      console.error('Failed to generate icons:', error);
      alert('Failed to generate icons. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format icon name for display
  const formatIconName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white font-light text-gray-900">
      {/* Sidebar */}
      <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
        {/* Search */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="Search icons..."
              className="focus:border-primary focus:ring-primary h-9 w-full border-gray-300 bg-white pl-10 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="max-h-[330px] flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-6 gap-0 p-2">
              {filteredIcons.slice(0, 300).map(iconName => {
                const Icon = icons[iconName as keyof typeof icons];
                const isSelected = selectedIcon === iconName;

                return Icon ? (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className={cn(
                      'aspect-square cursor-pointer rounded !bg-transparent p-1.5 transition-all',
                      isSelected
                        ? 'text-primary ring-primary ring-1'
                        : 'text-gray-600 hover:text-gray-900',
                    )}
                    title={iconName}
                  >
                    <Icon className="mx-auto h-4 w-4" />
                  </button>
                ) : null;
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Color Controls */}
        <div className="border-t border-b border-gray-200 p-4">
          <h3 className="mb-4 text-sm font-medium text-gray-700">
            Customization
          </h3>

          {/* Background Color */}
          <div className="mb-4">
            <label className="mb-2 block text-xs text-gray-600">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="hover:border-primary h-8 w-8 cursor-pointer rounded border border-gray-300 transition-all"
                    style={{ backgroundColor }}
                  />
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-gray-200 bg-white p-3"
                  align="start"
                >
                  <HexColorPicker
                    color={backgroundColor}
                    onChange={setBackgroundColor}
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={e => setBackgroundColor(e.target.value)}
                    className="mt-2 h-8 border-gray-300 bg-white font-mono text-xs text-gray-900"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={backgroundColor}
                onChange={e => setBackgroundColor(e.target.value)}
                className="h-8 flex-1 border-gray-300 bg-white font-mono text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Icon Color */}
          <div className="mb-4">
            <label className="mb-2 block text-xs text-gray-600">
              Icon Color
            </label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="hover:border-primary h-8 w-8 cursor-pointer rounded border border-gray-300 transition-all"
                    style={{ backgroundColor: iconColor }}
                  />
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto border-gray-200 bg-white p-3"
                  align="start"
                >
                  <HexColorPicker color={iconColor} onChange={setIconColor} />
                  <Input
                    type="text"
                    value={iconColor}
                    onChange={e => setIconColor(e.target.value)}
                    className="mt-2 h-8 border-gray-300 bg-white font-mono text-xs text-gray-900"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={iconColor}
                onChange={e => setIconColor(e.target.value)}
                className="h-8 flex-1 border-gray-300 bg-white font-mono text-xs text-gray-900"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div className="mb-4">
            <label className="mb-2 block text-xs text-gray-600">
              Border Radius: {borderRadius[0]}%
            </label>
            <Slider
              value={borderRadius}
              onValueChange={setBorderRadius}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Icon Size */}
          <div>
            <label className="mb-2 block text-xs text-gray-600">
              Icon Size: {iconSize[0]}%
            </label>
            <Slider
              value={iconSize}
              onValueChange={setIconSize}
              max={90}
              min={30}
              step={1}
              className="w-full"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-muted-foreground *:[a]:hover:text-primary flex flex-1 flex-col justify-end p-4 text-left text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          <div>
            Made with ❤️ by{' '}
            <a href="https://github.com/zlatanpham">Zlatan Pham</a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div>
            <h1 className="text-base font-normal text-gray-700">
              {formatIconName(selectedIcon)} Icon
            </h1>
            <p className="text-xs text-gray-500">PWA icon generator</p>
          </div>
          <Button onClick={handleDownload} disabled={isGenerating}>
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Download'}
          </Button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-50 px-8 py-6">
          <div className="mx-auto max-w-4xl">
            {/* Main Preview */}
            <div className="mb-12 flex justify-center rounded-lg bg-white p-8 shadow-sm">
              <div
                className="flex h-48 w-48 items-center justify-center shadow-lg"
                style={{
                  backgroundColor,
                  borderRadius: `${borderRadius[0]}%`,
                }}
              >
                {IconComponent && (
                  <IconComponent
                    style={{
                      color: iconColor,
                      width: `${iconSize[0]}%`,
                      height: `${iconSize[0]}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Size Variations */}
            <h2 className="mb-4 text-xl font-light text-gray-900">
              Size Variations
            </h2>
            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-end justify-center gap-6">
                {[
                  {
                    size: 512,
                    label: '512×512',
                    display: 'w-24 h-24',
                    iconSize: 'h-14 w-14',
                  },
                  {
                    size: 192,
                    label: '192×192',
                    display: 'w-20 h-20',
                    iconSize: 'h-12 w-12',
                  },
                  {
                    size: 96,
                    label: '96×96',
                    display: 'w-14 h-14',
                    iconSize: 'h-8 w-8',
                  },
                  {
                    size: 48,
                    label: '48×48',
                    display: 'w-10 h-10',
                    iconSize: 'h-6 w-6',
                  },
                  {
                    size: 32,
                    label: '32×32',
                    display: 'w-8 h-8',
                    iconSize: 'h-5 w-5',
                  },
                  {
                    size: 16,
                    label: '16×16',
                    display: 'w-6 h-6',
                    iconSize: 'h-3.5 w-3.5',
                  },
                ].map(preview => (
                  <div
                    key={preview.size}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={cn(
                        'mb-2 flex items-center justify-center',
                        preview.display,
                      )}
                      style={{
                        backgroundColor,
                        borderRadius: `${borderRadius[0]}%`,
                      }}
                    >
                      {IconComponent && (
                        <IconComponent
                          className={preview.iconSize}
                          style={{
                            color: iconColor,
                            width: `${iconSize[0]}%`,
                            height: `${iconSize[0]}%`,
                          }}
                        />
                      )}
                    </div>
                    <code className="text-xs text-gray-500">
                      {preview.label}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <h2 className="mb-3 text-xl font-light text-gray-900">Features</h2>
            <ul className="mb-8 space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong className="text-gray-900">All Sizes</strong> included
                from 16×16 to 1024×1024
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong className="text-gray-900">Favicon.ico</strong> with
                multiple resolutions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong className="text-gray-900">Apple Touch Icon</strong> for
                iOS devices
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong className="text-gray-900">Android Icons</strong>{' '}
                including maskable versions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong className="text-gray-900">manifest.json</strong> ready
                for PWA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <strong className="text-gray-900">HTML meta tags</strong> for
                easy implementation
              </li>
            </ul>

            {/* Installation */}
            <h2 className="mb-3 text-xl font-light text-gray-900">
              Installation
            </h2>
            <ol className="mb-8 list-inside list-decimal space-y-2 text-sm text-gray-700">
              <li>
                Click the{' '}
                <strong className="text-gray-900">Download Icons</strong> button
              </li>
              <li>
                Extract the ZIP file to your project&apos;s public directory
              </li>
              <li>
                Add the HTML meta tags from{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-800">
                  html-meta-tags.txt
                </code>{' '}
                to your{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-800">
                  &lt;head&gt;
                </code>
              </li>
              <li>
                Update{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-gray-800">
                  manifest.json
                </code>{' '}
                with your app details
              </li>
            </ol>

            {/* Code Example */}
            <h2 className="mb-3 text-xl font-light text-gray-900">
              Quick Start
            </h2>
            <div className="rounded-lg border border-gray-200 bg-gray-900 p-4 font-mono text-xs">
              <div className="text-green-400">
                {'<!-- Add to your HTML <head> -->'}
              </div>
              <div>
                <span className="text-blue-400">&lt;link</span>
                <span className="text-yellow-300"> rel</span>
                <span className="text-white">=</span>
                <span className="text-green-300">&quot;icon&quot;</span>
                <span className="text-yellow-300"> href</span>
                <span className="text-white">=</span>
                <span className="text-green-300">&quot;/favicon.ico&quot;</span>
                <span className="text-blue-400">&gt;</span>
              </div>
              <div>
                <span className="text-blue-400">&lt;link</span>
                <span className="text-yellow-300"> rel</span>
                <span className="text-white">=</span>
                <span className="text-green-300">&quot;manifest&quot;</span>
                <span className="text-yellow-300"> href</span>
                <span className="text-white">=</span>
                <span className="text-green-300">
                  &quot;/manifest.json&quot;
                </span>
                <span className="text-blue-400">&gt;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
