'use client';

import { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import {
  SvgProcessor,
  UploadedSvg,
  SvgValidationResult,
} from '@/lib/svg-processor';

interface SvgUploaderProps {
  onUploadSuccess: (uploadedSvg: UploadedSvg) => void;
  onUploadError: (error: string) => void;
  disabled?: boolean;
}

export default function SvgUploader({
  onUploadSuccess,
  onUploadError,
  disabled = false,
}: SvgUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const file = files[0]; // Only handle the first file for now
      setError(null);
      setIsProcessing(true);

      try {
        const result: SvgValidationResult =
          await SvgProcessor.processSvgFile(file);

        if (!result.isValid) {
          setError(result.error || 'File processing failed');
          onUploadError(result.error || 'File processing failed');
          return;
        }

        const uploadedSvg = SvgProcessor.createUploadedSvg(file, result);
        onUploadSuccess(uploadedSvg);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        onUploadError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [onUploadSuccess, onUploadError],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Clear the input so the same file can be selected again
      e.target.value = '';
    },
    [handleFiles],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="flex h-full flex-col p-4">
      {/* Upload Area */}
      <div
        className={`relative flex flex-1 items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging && !disabled
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleFileSelect}
          disabled={disabled || isProcessing}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />

        <div className="space-y-2">
          <Upload
            className={`mx-auto h-6 w-6 ${
              isDragging && !disabled ? 'text-blue-500' : 'text-gray-400'
            }`}
          />

          <div className="text-xs text-gray-600">
            {isProcessing ? (
              <span>Processing SVG...</span>
            ) : (
              <>
                <span className="font-medium">Drop SVG file here</span>
                <span className="block">or click to browse</span>
                <span className="mt-1 block text-gray-400">Max 2MB</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span className="text-xs text-red-700">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mt-2 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <span className="ml-2 text-xs text-gray-600">Processing...</span>
        </div>
      )}
    </div>
  );
}
