/**
 * 검색 유틸리티 함수
 */

/**
 * 문자열을 정규화 (공백 제거, 소문자 변환)
 */
export const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/\s+/g, '');
};

/**
 * Like 검색 (대소문자 구분 없음, 부분 일치)
 */
export const likeSearch = (text: string, query: string): boolean => {
  if (!query) return true;
  return normalizeString(text).includes(normalizeString(query));
};

/**
 * 다중 필드 검색
 * @param item 검색할 객체
 * @param query 검색어
 * @param fields 검색할 필드 배열
 */
export const multiFieldSearch = <T extends Record<string, any>>(
  item: T,
  query: string,
  fields: (keyof T)[]
): boolean => {
  if (!query) return true;

  return fields.some((field) => {
    const value = item[field];
    if (typeof value === 'string') {
      return likeSearch(value, query);
    }
    if (typeof value === 'number') {
      return value.toString().includes(query);
    }
    return false;
  });
};

/**
 * 하이라이트용 텍스트 분할
 * @param text 원본 텍스트
 * @param query 검색어
 * @returns 하이라이트 정보가 포함된 배열
 */
export const highlightText = (
  text: string,
  query: string
): Array<{ text: string; highlight: boolean }> => {
  if (!query) {
    return [{ text, highlight: false }];
  }

  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1) {
    return [{ text, highlight: false }];
  }

  const result: Array<{ text: string; highlight: boolean }> = [];

  if (index > 0) {
    result.push({ text: text.substring(0, index), highlight: false });
  }

  result.push({
    text: text.substring(index, index + query.length),
    highlight: true,
  });

  if (index + query.length < text.length) {
    result.push({
      text: text.substring(index + query.length),
      highlight: false,
    });
  }

  return result;
};

/**
 * 중복 검색어 제거 및 정렬
 * @param searches 검색 기록 배열
 * @param maxCount 최대 개수
 */
export const deduplicateSearches = (searches: string[], maxCount: number = 10): string[] => {
  // 중복 제거 (대소문자 구분 없이)
  const uniqueMap = new Map<string, string>();

  searches.forEach((search) => {
    const normalized = search.toLowerCase().trim();
    if (normalized && !uniqueMap.has(normalized)) {
      uniqueMap.set(normalized, search);
    }
  });

  // 최신순으로 정렬 (역순으로 입력되었다고 가정)
  return Array.from(uniqueMap.values()).slice(0, maxCount);
};

/**
 * 검색어 추천 (자동완성)
 * @param query 현재 입력된 검색어
 * @param suggestions 추천 후보 목록
 * @param maxCount 최대 추천 개수
 */
export const getSuggestions = (
  query: string,
  suggestions: string[],
  maxCount: number = 5
): string[] => {
  if (!query) return [];

  const normalizedQuery = normalizeString(query);

  return suggestions
    .filter((suggestion) => normalizeString(suggestion).includes(normalizedQuery))
    .slice(0, maxCount);
};
