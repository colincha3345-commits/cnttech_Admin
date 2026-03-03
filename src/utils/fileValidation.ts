/**
 * 파일 업로드 보안 검증 유틸
 *
 * 화이트리스트 기반 MIME + 확장자 이중 검증
 * 웹쉘, 악성 스크립트 업로드 방지
 */

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

/** 허용 이미지 MIME + 확장자 */
const IMAGE_WHITELIST = {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

/** 허용 Excel MIME + 확장자 */
const EXCEL_WHITELIST = {
    mimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel',                                           // .xls
    ],
    extensions: ['.xlsx', '.xls'],
};

/** 허용 CSV MIME + 확장자 */
const CSV_WHITELIST = {
    mimeTypes: ['text/csv', 'text/plain', 'application/csv'],
    extensions: ['.csv'],
};

function getExtension(filename: string): string {
    return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

function validateFile(
    file: File,
    whitelist: { mimeTypes: string[]; extensions: string[] },
    maxSizeBytes: number,
): FileValidationResult {
    const ext = getExtension(file.name);

    // 확장자 검증
    if (!whitelist.extensions.includes(ext)) {
        return {
            valid: false,
            error: `허용되지 않는 파일 형식입니다. (허용: ${whitelist.extensions.join(', ')})`,
        };
    }

    // MIME 타입 검증 (확장자 위조 방지)
    if (file.type && !whitelist.mimeTypes.includes(file.type)) {
        return {
            valid: false,
            error: `파일 형식이 올바르지 않습니다. (감지된 타입: ${file.type})`,
        };
    }

    // 파일 크기 검증
    if (file.size > maxSizeBytes) {
        const limitMB = (maxSizeBytes / 1024 / 1024).toFixed(0);
        return { valid: false, error: `파일 크기는 ${limitMB}MB 이하여야 합니다.` };
    }

    // 빈 파일 차단
    if (file.size === 0) {
        return { valid: false, error: `비어있는 파일은 업로드할 수 없습니다.` };
    }

    return { valid: true };
}

/** 이미지 파일 검증 (최대 5MB) */
export function validateImageFile(
    file: File,
    maxSizeBytes = 5 * 1024 * 1024,
): FileValidationResult {
    return validateFile(file, IMAGE_WHITELIST, maxSizeBytes);
}

/** Excel 파일 검증 (최대 10MB) */
export function validateExcelFile(
    file: File,
    maxSizeBytes = 10 * 1024 * 1024,
): FileValidationResult {
    return validateFile(file, EXCEL_WHITELIST, maxSizeBytes);
}

/** CSV 파일 검증 (최대 5MB) */
export function validateCsvFile(
    file: File,
    maxSizeBytes = 5 * 1024 * 1024,
): FileValidationResult {
    return validateFile(file, CSV_WHITELIST, maxSizeBytes);
}
