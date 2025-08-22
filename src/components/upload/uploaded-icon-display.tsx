'use client';

import { X, FileImage } from 'lucide-react';
import { UploadedSvg } from '@/lib/svg-processor';

interface UploadedIconDisplayProps {
  uploadedSvg: UploadedSvg | null;
  onRemoveSvg: () => void;
}

export default function UploadedIconDisplay({
  uploadedSvg,
  onRemoveSvg,
}: UploadedIconDisplayProps) {
  if (!uploadedSvg) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <FileImage className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="text-sm">No custom icon uploaded</p>
          <p className="mt-1 text-xs text-gray-400">Upload an SVG file above</p>
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
    <div className="flex h-full flex-col p-4">
      <div className="flex-1 rounded-lg border border-gray-200 bg-white p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Custom Icon</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={onRemoveSvg}
              className="rounded p-1 text-gray-400 transition-colors hover:bg-red-100 hover:text-red-600"
              title="Remove custom icon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Icon Preview */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50">
            <div
              className="flex h-8 w-8 items-center justify-center"
              dangerouslySetInnerHTML={{
                __html: uploadedSvg.sanitizedSvg
                  // Keep original colors in the display box - no color transformations
                  .replace(
                    /<svg([^>]*)>/i,
                    '<svg$1 width="32" height="32" style="max-width: 32px; max-height: 32px;">',
                  ),
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-gray-900">
              {uploadedSvg.name}
            </div>
            <div className="text-xs text-gray-500">
              {formatFileSize(uploadedSvg.fileSize)} • Uploaded{' '}
              {uploadedSvg.uploadedAt.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 rounded bg-blue-50 p-3 text-xs text-gray-600">
          <p className="mb-1 font-medium text-blue-900">✓ Ready to generate</p>
          <p className="mb-2">
            Your custom icon will be used for all generated formats and sizes.
          </p>
          <button
            onClick={onRemoveSvg}
            className="font-medium text-blue-700 underline hover:text-blue-900"
          >
            Upload a different icon
          </button>
        </div>
      </div>
    </div>
  );
}
