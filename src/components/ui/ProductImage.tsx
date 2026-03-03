import React, { useState } from 'react';
import { Skeleton } from './skeleton';
import { PictureOutlined } from '@ant-design/icons';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  size = 'md',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClass = sizeMap[size];

  // 이미지 없거나 에러 발생 시 스켈레톤/플레이스홀더 표시
  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}
      >
        <PictureOutlined className="text-gray-400 text-xl" />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-lg overflow-hidden bg-hover flex-shrink-0 relative ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};
