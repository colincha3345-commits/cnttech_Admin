import React, { useState, useRef } from 'react';
import { UploadOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import { Button } from './Button';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  maxSize?: number;
  aspectRatio?: number;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
}) => {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('JPG, PNG, WEBP 형식만 지원합니다');
      return false;
    }

    // 파일 크기 검증
    if (file.size > maxSize) {
      setError(`파일 크기는 ${(maxSize / 1024 / 1024).toFixed(0)}MB 이하여야 합니다`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    setError('');
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* 업로드 영역 */}
      <div
        className={`
          relative overflow-hidden rounded-xl border-2 border-dashed
          transition-all duration-200
          ${preview ? 'border-transparent' : isDragging ? 'border-primary bg-hover' : 'border-border hover:border-primary/50 hover:bg-hover'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled && !preview ? handleClick : undefined}
      >
        {preview ? (
          // 이미지 미리보기
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            {/* 호버 오버레이 */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                disabled={disabled}
              >
                <UploadOutlined />
                변경
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled}
              >
                <DeleteOutlined />
                삭제
              </Button>
            </div>
          </div>
        ) : (
          // 빈 상태
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-hover">
              <PictureOutlined className="text-3xl text-txt-muted" />
            </div>
            <p className="text-sm font-medium text-txt-main mb-1">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-txt-muted">
              JPG, PNG, WEBP (최대 {(maxSize / 1024 / 1024).toFixed(0)}MB)
            </p>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-critical flex items-center gap-2">
          <span className="inline-block w-1 h-1 rounded-full bg-critical" />
          {error}
        </p>
      )}
    </div>
  );
};
