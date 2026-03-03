import React, { useState, useRef } from 'react';
import { DeleteOutlined, PictureOutlined } from '@ant-design/icons';

interface MultiImageUploadProps {
  value?: string[]; // 기존 이미지 URL 배열
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
}

export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
}) => {
  const [previews, setPreviews] = useState<string[]>(value);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
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

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (newFiles: FileList) => {
    setError('');

    const fileArray = Array.from(newFiles);
    const currentCount = previews.length;

    // 최대 파일 개수 체크
    if (currentCount + fileArray.length > maxFiles) {
      setError(`최대 ${maxFiles}개까지 업로드 가능합니다`);
      return;
    }

    // 각 파일 유효성 검사
    const validFiles = fileArray.filter((file) => validateFile(file));

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onChange(updatedFiles);

      // Promise.all로 모든 미리보기를 안전하게 병렬 생성
      try {
        const newPreviews = await Promise.all(validFiles.map(readFileAsDataURL));
        setPreviews((prev) => [...prev, ...newPreviews]);
      } catch {
        setError('이미지 미리보기 생성에 실패했습니다');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);

    setPreviews(newPreviews);
    setFiles(newFiles);
    onChange(newFiles);
    setError('');
  };

  const handleClick = () => {
    if (previews.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* 이미지 그리드 */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 삭제 버튼 */}
              {!disabled && (
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 w-8 h-8 bg-critical text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-critical/90"
                  title="삭제"
                >
                  <DeleteOutlined className="text-sm" />
                </button>
              )}

              {/* 인덱스 표시 */}
              <div className="absolute bottom-2 left-2 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 (최대 개수 미달 시) */}
      {previews.length < maxFiles && (
        <div
          className={`
            relative overflow-hidden rounded-xl border-2 border-dashed
            transition-all duration-200 border-gray-300 hover:border-gray-400 hover:bg-gray-50
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={!disabled ? handleClick : undefined}
        >
          <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
            <div className="mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
              <PictureOutlined className="text-2xl text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, WEBP (최대 {maxFiles}개, 각 {(maxSize / 1024 / 1024).toFixed(0)}MB)
            </p>
            <p className="text-xs text-gray-400 mt-1">
              현재 {previews.length}/{maxFiles}개
            </p>
          </div>
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-critical/10 border border-critical/30 rounded-xl">
          <span className="text-critical">⚠️</span>
          <p className="text-xs text-critical font-medium">{error}</p>
        </div>
      )}

      {/* 안내 메시지 */}
      {previews.length === 0 && (
        <p className="text-xs text-gray-500">
          여러 이미지를 한번에 선택할 수 있습니다
        </p>
      )}
    </div>
  );
};
