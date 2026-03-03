import { useState, useEffect, useRef } from 'react';
import { SearchOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/ui/SearchInput';
import { deduplicateSearches } from '@/utils/search';

const SEARCH_HISTORY_KEY = 'admin_search_history';
const MAX_HISTORY = 10;

interface SearchResult {
  type: 'menu' | 'page';
  title: string;
  path: string;
  description?: string;
}

// 검색 가능한 페이지/메뉴 목록
const searchableItems: SearchResult[] = [
  { type: 'page', title: '대시보드', path: '/dashboard', description: '운영 현황 모니터링' },
  { type: 'page', title: '사용자 관리', path: '/users', description: '시스템 사용자 관리' },
  { type: 'page', title: '설정', path: '/settings', description: '시스템 설정 관리' },
  { type: 'menu', title: '카테고리 관리', path: '/menu/categories', description: '메뉴 카테고리 관리' },
  { type: 'menu', title: '메뉴 관리', path: '/menu/products', description: '가맹점 메뉴 등록 및 관리' },
];

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 검색 기록 로드
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // 검색어 변경 시 결과 필터링
  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      return;
    }

    const normalizedQuery = query.toLowerCase();
    const results = searchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery)
    );

    setFilteredResults(results);
  }, [query]);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 검색 실행
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // 검색 기록 저장
    const newHistory = deduplicateSearches([searchQuery, ...searchHistory], MAX_HISTORY);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));

    // 검색 결과가 하나만 있으면 바로 이동
    const singleResult = filteredResults[0];
    if (filteredResults.length === 1 && singleResult) {
      navigate(singleResult.path);
      setQuery('');
      setIsOpen(false);
    }
  };

  // 결과 아이템 클릭
  const handleResultClick = (result: SearchResult) => {
    // 검색 기록에 추가
    const newHistory = deduplicateSearches([result.title, ...searchHistory], MAX_HISTORY);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));

    navigate(result.path);
    setQuery('');
    setIsOpen(false);
  };

  // 검색 기록 아이템 클릭
  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    setIsOpen(true);
  };

  // 검색 기록 삭제
  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // 검색 기록 개별 삭제
  const handleRemoveHistory = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <SearchInput
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        onFocus={() => setIsOpen(true)}
        placeholder="페이지 또는 메뉴 검색..."
        className="w-64"
        autoFocus={false}
      />

      {/* 드롭다운 */}
      {isOpen && (query || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-main border border-border rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
          {/* 검색 결과 */}
          {query && filteredResults.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-txt-secondary uppercase tracking-wide">
                검색 결과
              </p>
              {filteredResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <SearchOutlined className="text-txt-muted" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-txt-main truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-txt-muted truncate">{result.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-txt-muted px-2 py-1 bg-hover rounded">
                      {result.type === 'page' ? '페이지' : '메뉴'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 검색 결과 없음 */}
          {query && filteredResults.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-txt-muted">검색 결과가 없습니다</p>
            </div>
          )}

          {/* 최근 검색어 */}
          {!query && searchHistory.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <p className="text-xs font-semibold text-txt-secondary uppercase tracking-wide">
                  최근 검색어
                </p>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-txt-muted hover:text-txt-main transition-colors"
                >
                  전체 삭제
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-hover transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <ClockCircleOutlined className="text-txt-muted" />
                    <span className="flex-1 text-sm text-txt-main truncate">{item}</span>
                    <button
                      onClick={(e) => handleRemoveHistory(index, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="삭제"
                    >
                      <CloseOutlined className="text-xs text-txt-muted hover:text-txt-main" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
