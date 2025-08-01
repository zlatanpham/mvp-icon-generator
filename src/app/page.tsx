'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { icons } from 'lucide-react';
import { Search, Download, Package, AlertCircle } from 'lucide-react';
import { generateAllIcons } from '@/lib/icon-generator';
import { cn } from '@/lib/utils';

export default function Home() {
  const [selectedIcon, setSelectedIcon] = useState<string>('alarm-clock-minus');
  const [backgroundColor, setBackgroundColor] = useState('#1e293b');
  const [iconColor, setIconColor] = useState('#ffffff');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get all icon names and filter based on search
  const iconNames = Object.keys(icons);

  const filteredIcons = iconNames.filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const IconComponent = icons[selectedIcon as keyof typeof icons];

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
      .join('');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-green-600">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">IconForge</span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="Search icons..."
              className="border-gray-200 bg-gray-50 pl-10 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-hidden px-4 pb-4">
          <div className="mb-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
            SELECT ICON
          </div>
          <ScrollArea className="h-[calc(100%-28px)]">
            <div className="grid grid-cols-6 gap-1">
              {filteredIcons.slice(0, 300).map(iconName => {
                const Icon = icons[iconName as keyof typeof icons];
                const isSelected = selectedIcon === iconName;

                return Icon ? (
                  <button
                    key={iconName}
                    onClick={() => setSelectedIcon(iconName)}
                    className={cn(
                      'rounded p-2.5 transition-all hover:scale-110',
                      isSelected
                        ? 'bg-gray-900 text-white'
                        : 'hover:bg-gray-100',
                    )}
                    title={iconName}
                  >
                    <Icon className="mx-auto h-4 w-4" />
                  </button>
                ) : null;
              })}
            </div>
          </ScrollArea>
          <p className="mt-3 text-center text-xs text-gray-500">
            {filteredIcons.length} icons • Selected:{' '}
            {formatIconName(selectedIcon)}
          </p>
        </div>

        {/* Color Controls */}
        <div className="space-y-4 border-t border-gray-200 p-4">
          <div className="text-xs font-medium tracking-wider text-gray-500 uppercase">
            CUSTOMIZATION
          </div>

          {/* Background Color */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="h-8 w-8 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                    style={{ backgroundColor }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <HexColorPicker
                    color={backgroundColor}
                    onChange={setBackgroundColor}
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={e => setBackgroundColor(e.target.value)}
                    className="mt-3 font-mono text-xs"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={backgroundColor}
                onChange={e => setBackgroundColor(e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>
          </div>

          {/* Icon Color */}
          <div>
            <label className="mb-2 block text-sm text-gray-700">
              Icon Color
            </label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="h-8 w-8 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                    style={{ backgroundColor: iconColor }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <HexColorPicker color={iconColor} onChange={setIconColor} />
                  <Input
                    type="text"
                    value={iconColor}
                    onChange={e => setIconColor(e.target.value)}
                    className="mt-3 font-mono text-xs"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="text"
                value={iconColor}
                onChange={e => setIconColor(e.target.value)}
                className="h-8 font-mono text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Icon Preview</h1>

          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-green-600 px-6 text-white hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Download Icons'}
          </Button>
        </header>

        {/* Alert Banner */}
        <div className="border-b border-orange-200 bg-orange-50 px-6 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
            <p className="text-sm text-orange-800">
              Generated package includes all PWA icon sizes (16×16 to
              1024×1024), favicon.ico, manifest.json, and HTML meta tags for
              easy implementation.
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="mx-auto max-w-4xl p-8">
            {/* Icon Name and Description */}
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">
                {formatIconName(selectedIcon)} Icon
              </h2>
              <p className="text-gray-600">
                Preview your icon in various sizes with custom colors
              </p>
            </div>

            {/* Main Preview */}
            <div className="mb-12 flex justify-center">
              <div className="relative">
                <div
                  className="flex h-64 w-64 items-center justify-center rounded-[24%] shadow-2xl"
                  style={{ backgroundColor }}
                >
                  {IconComponent && (
                    <IconComponent
                      className="h-32 w-32"
                      style={{ color: iconColor }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Size Variations */}
            <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-center text-lg font-semibold text-gray-900">
                Size Variations
              </h3>
              <div className="flex items-end justify-center gap-8">
                {[
                  {
                    size: 512,
                    label: '512×512',
                    display: 'w-32 h-32',
                    iconSize: 'h-20 w-20',
                  },
                  {
                    size: 192,
                    label: '192×192',
                    display: 'w-24 h-24',
                    iconSize: 'h-14 w-14',
                  },
                  {
                    size: 96,
                    label: '96×96',
                    display: 'w-16 h-16',
                    iconSize: 'h-10 w-10',
                  },
                  {
                    size: 48,
                    label: '48×48',
                    display: 'w-12 h-12',
                    iconSize: 'h-7 w-7',
                  },
                  {
                    size: 32,
                    label: '32×32',
                    display: 'w-10 h-10',
                    iconSize: 'h-6 w-6',
                  },
                  {
                    size: 16,
                    label: '16×16',
                    display: 'w-8 h-8',
                    iconSize: 'h-4 w-4',
                  },
                ].map(preview => (
                  <div
                    key={preview.size}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={cn(
                        'mb-2 flex items-center justify-center rounded-[20%]',
                        preview.display,
                      )}
                      style={{ backgroundColor }}
                    >
                      {IconComponent && (
                        <IconComponent
                          className={preview.iconSize}
                          style={{ color: iconColor }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{preview.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-lg font-semibold text-gray-900">
                What's Included in Your Download
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-medium text-gray-900">Icon Files</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      All PWA icon sizes (16×16 to 1024×1024)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Favicon.ico with multiple resolutions
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Apple touch icon (180×180)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Android chrome icons (192×192, 512×512)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Maskable icons for Android adaptive icons
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-3 font-medium text-gray-900">
                    Configuration Files
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Complete manifest.json for PWA
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      HTML meta tags snippet
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Installation instructions (README.txt)
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Optimized PNG files with proper compression
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      Cross-platform compatibility
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
