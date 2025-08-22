'use client';

import { X, FileImage } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadedSvg } from '@/lib/svg-processor';
import { cn } from '@/lib/utils';

interface UploadedIconsGridProps {
  uploadedSvgs: UploadedSvg[];
  selectedSvgId: string | null;
  onSelectSvg: (svgId: string) => void;
  onRemoveSvg: (svgId: string) => void;
  searchQuery: string;
}

export default function UploadedIconsGrid({
  uploadedSvgs,
  selectedSvgId,
  onSelectSvg,
  onRemoveSvg,
  searchQuery,
}: UploadedIconsGridProps) {
  // Filter uploaded SVGs based on search query
  const filteredSvgs = uploadedSvgs.filter(
    svg =>
      svg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svg.originalName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (uploadedSvgs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <FileImage className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm">No uploaded SVGs yet</p>
          <p className="mt-1 text-xs text-gray-400">
            Upload an SVG file to get started
          </p>
        </div>
      </div>
    );
  }

  if (filteredSvgs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <FileImage className="mx-auto mb-2 h-8 w-8 text-gray-300" />
          <p className="text-sm">No matching SVGs</p>
          <p className="mt-1 text-xs text-gray-400">
            Try a different search term
          </p>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-h-[330px] flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-1 p-2">
          {filteredSvgs.map(svg => {
            const isSelected = selectedSvgId === svg.id;

            return (
              <div
                key={svg.id}
                className={cn(
                  'group relative flex cursor-pointer items-center gap-3 rounded p-2 transition-all',
                  isSelected
                    ? 'border border-blue-200 bg-blue-50'
                    : 'border border-transparent hover:bg-gray-50',
                )}
                onClick={() => onSelectSvg(svg.id)}
                title={svg.originalName}
              >
                {/* SVG Preview */}
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-white',
                    isSelected ? 'border-blue-300' : '',
                  )}
                >
                  <div
                    className="h-6 w-6"
                    dangerouslySetInnerHTML={{
                      __html: svg.sanitizedSvg.replace(
                        /<svg([^>]*)>/i,
                        '<svg$1 width="24" height="24" class="text-gray-600">',
                      ),
                    }}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-gray-900">
                    {svg.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFileSize(svg.fileSize)}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveSvg(svg.id);
                  }}
                  className={cn(
                    'flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600',
                    'opacity-0 group-hover:opacity-100',
                    isSelected ? 'opacity-100' : '',
                  )}
                  title="Remove SVG"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
