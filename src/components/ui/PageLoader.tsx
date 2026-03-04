import { clsx } from 'clsx';
import '@/styles/loader.css';

interface PageLoaderProps {
    text?: string;
    className?: string;
    fullScreen?: boolean;
}

export function PageLoader({ text, className, fullScreen = false }: PageLoaderProps) {
    return (
        <div
            className={clsx(
                'flex flex-col items-center justify-center',
                fullScreen ? 'fixed inset-0 bg-bg-main/80 backdrop-blur-sm z-50' : 'w-full h-full min-h-[300px]',
                className
            )}
        >
            <div className="logo-loader-container">
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(10, 20)">
                        {/* 1. 파란색 마름모 (가장 먼저 등장) */}
                        <rect x="40" y="55" width="45" height="45" transform="rotate(45 62.5 77.5)" className="logo-part part-1" />

                        {/* 2. 상단 검정 마름모 */}
                        <rect x="85" y="10" width="45" height="45" transform="rotate(45 107.5 32.5)" className="logo-part part-2" />

                        {/* 3. 하단 검정 마름모 */}
                        <rect x="85" y="100" width="45" height="45" transform="rotate(45 107.5 122.5)" className="logo-part part-3" />
                    </g>

                    {/* 4. 텍스트 (마지막 등장) */}
                    <text x="100" y="180" textAnchor="middle" className="logo-part part-text">CNTTECH</text>
                </svg>
            </div>
            {text && <p className="mt-4 text-sm font-medium text-txt-secondary animate-pulse">{text}</p>}
        </div>
    );
}
