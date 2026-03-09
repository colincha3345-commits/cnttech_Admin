/**
 * CSV 유틸리티 함수
 * 메뉴 데이터의 CSV 가져오기/내보내기
 */

import type { Product, ProductFormData } from '@/types/product';

/**
 * CSV 헤더 정의
 */
export const CSV_HEADERS = [
  '메뉴명',
  '가격',
  '설명',
  '이미지URL',
  '태그',
  '메인카테고리ID',
  '서브카테고리IDs',
  '판매상태',
  '앱노출',
  '쿠폰허용',
  '교환권허용',
  '금액권허용',
  '상품코드',
  '포스코드',
  '칼로리',
  '나트륨',
  '탄수화물',
  '당류',
  '지방',
  '단백질',
  '제공량',
  '알레르기',
  '표시순서',
] as const;

/**
 * Product를 CSV 행으로 변환
 */
export const productToCsvRow = (product: Product): string[] => {
  return [
    product.name,
    product.price.toString(),
    product.description,
    product.imageUrl,
    product.tags.map((t) => t.code).join('|'),
    product.mainCategoryId,
    product.subCategoryIds.join('|'),
    product.status,
    product.isVisible ? 'Y' : 'N',
    product.allowCoupon ? 'Y' : 'N',
    product.allowVoucher ? 'Y' : 'N',
    product.allowGiftCard ? 'Y' : 'N',
    product.productCode || '',
    product.posCode || '',
    product.nutrition.calories.toString(),
    product.nutrition.sodium.toString(),
    product.nutrition.carbs.toString(),
    product.nutrition.sugar.toString(),
    product.nutrition.fat.toString(),
    product.nutrition.protein.toString(),
    product.nutrition.servingSize,
    product.allergens.map((a) => a.code).join('|'),
    product.displayOrder.toString(),
  ];
};

/**
 * CSV 행을 ProductFormData로 변환
 */
export const csvRowToProductFormData = (row: string[]): ProductFormData => {
  const mainCategoryId = row[5] || '1';
  return {
    name: row[0] || '',
    price: parseInt(row[1] || '0', 10),
    description: row[2] || '',
    imageUrl: row[3] || '',
    tags: row[4] ? row[4].split('|').filter(Boolean) : ['MAIN'],
    categoryPairs: [{ id: `pair-${Date.now()}`, mainCategoryId, subCategoryId: '' }],
    mainCategoryId,
    subCategoryIds: row[6] ? row[6].split('|').filter(Boolean) : [],
    optionGroupIds: [],
    status: (row[7] || 'inactive') as 'active' | 'inactive' | 'pending',
    isVisible: row[8] === 'Y',
    applyToAll: true,
    storeIds: [],
    allowCoupon: row[9] === 'Y',
    allowVoucher: row[10] === 'Y',
    allowGiftCard: row[11] === 'Y',
    productCode: row[12] || undefined,
    posCode: row[13] || undefined,
    origin: [],
    nutrition: {
      calories: parseInt(row[14] || '0', 10),
      sodium: parseInt(row[15] || '0', 10),
      carbs: parseInt(row[16] || '0', 10),
      sugar: parseInt(row[17] || '0', 10),
      fat: parseInt(row[18] || '0', 10),
      protein: parseInt(row[19] || '0', 10),
      servingSize: row[20] || '',
    },
    allergens: row[21] ? row[21].split('|').filter(Boolean) : [],
    badgeIds: [],
    displayOrder: parseInt(row[22] || '999', 10),
  };
};

/**
 * CSV Injection 방어: =, +, -, @ 로 시작하는 셀에 앞에 ' 추가
 * Excel/Google Sheets에서 수식으로 해석되는 것을 방지
 */
const sanitizeCsvCell = (cell: string): string => {
  if (/^[=+\-@\t\r]/.test(cell)) {
    return `'${cell}`;
  }
  return cell;
};

/**
 * CSV 문자열 생성
 */
export const generateCsv = (products: Product[]): string => {
  const rows = [
    CSV_HEADERS.join(','), // 헤더
    ...products.map((product) => {
      return productToCsvRow(product)
        .map((cell) => {
          const cellStr = sanitizeCsvCell(String(cell));
          // 쉼표나 줄바꿈이 포함된 경우 따옴표로 감싸기
          if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',');
    }),
  ];

  return rows.join('\n');
};

/**
 * CSV 문자열 파싱
 */
export const parseCsv = (csvString: string): ProductFormData[] => {
  const lines = csvString.split('\n').filter((line) => line.trim());

  if (lines.length < 2) {
    throw new Error('CSV 파일이 비어있거나 헤더만 있습니다');
  }

  // 첫 줄은 헤더이므로 제외
  const dataLines = lines.slice(1);

  return dataLines.map((line, index) => {
    try {
      // 간단한 CSV 파싱 (따옴표 처리 포함)
      const row = parseCsvLine(line);
      return csvRowToProductFormData(row);
    } catch (error) {
      throw new Error(`${index + 2}번째 줄 파싱 실패: ${error}`);
    }
  });
};

/**
 * CSV 한 줄 파싱 (따옴표 처리)
 */
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        current += '"';
        i++; // 다음 따옴표 건너뛰기
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 구분
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

/**
 * CSV 문자열을 파일로 다운로드 (공통 헬퍼)
 */
const downloadCsvString = (csvContent: string, filename: string) => {
  const bom = '\uFEFF'; // UTF-8 BOM (Excel에서 한글 깨짐 방지)
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * CSV 파일 다운로드
 */
export const downloadCsv = (products: Product[], filename: string = 'products.csv') => {
  downloadCsvString(generateCsv(products), filename);
};

/**
 * CSV 파일 읽기
 */
export const readCsvFile = (file: File): Promise<ProductFormData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const products = parseCsv(text);
        resolve(products);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };

    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * CSV 템플릿 생성
 */
export const generateCsvTemplate = (): string => {
  return CSV_HEADERS.join(',') + '\n';
};

/**
 * CSV 템플릿 다운로드
 */
export const downloadCsvTemplate = () => {
  downloadCsvString(generateCsvTemplate(), 'menu_template.csv');
};
