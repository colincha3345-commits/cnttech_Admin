/**
 * 매장 등록/수정 폼 페이지
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons';

import { Card, Button, Input, Spinner } from '@/components/ui';
import {
  useStore,
  useCreateStore,
  useUpdateStore,
  useCheckBusinessNumber,
  useToast,
} from '@/hooks';
import {
  STORE_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
  REGIONS,
  BANKS,
  type StoreFormData,
  type StoreStatus,
  type ContractStatus,
  type Region,
} from '@/types/store';

// 유틸리티 함수
const formatDateForInput = (date: Date): string => {
  const isoString = new Date(date).toISOString();
  return isoString.split('T')[0] ?? isoString.substring(0, 10);
};

interface StoreFormProps {
  mode: 'create' | 'edit';
}

export const StoreForm: React.FC<StoreFormProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: existingStore, isLoading: isLoadingStore } = useStore(
    mode === 'edit' ? id : undefined
  );
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const checkBusinessNumber = useCheckBusinessNumber();

  const [isBusinessNumberValid, setIsBusinessNumberValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    code: '',
    status: 'pending',
    address: {
      zipCode: '',
      address: '',
      addressDetail: '',
      region: '서울',
    },
    owner: {
      name: '',
      phone: '',
      email: '',
    },
    business: {
      businessNumber: '',
      businessName: '',
      representativeName: '',
      businessType: '',
      businessCategory: '',
    },
    contract: {
      contractDate: '',
      expirationDate: '',
      contractStatus: 'active',
      notes: '',
    },
    bankAccount: {
      bankCode: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
    },
    openingDate: '',
    operatingHours: '',
  });

  // 기존 데이터 로드
  useEffect(() => {
    if (mode === 'edit' && existingStore) {
      setFormData({
        name: existingStore.name,
        code: existingStore.code || '',
        status: existingStore.status,
        address: { ...existingStore.address },
        owner: {
          name: existingStore.owner.name,
          phone: existingStore.owner.phone,
          email: existingStore.owner.email || '',
        },
        business: {
          businessNumber: existingStore.business.businessNumber,
          businessName: existingStore.business.businessName,
          representativeName: existingStore.business.representativeName,
          businessType: existingStore.business.businessType || '',
          businessCategory: existingStore.business.businessCategory || '',
        },
        contract: {
          contractDate: formatDateForInput(existingStore.contract.contractDate),
          expirationDate: formatDateForInput(existingStore.contract.expirationDate),
          contractStatus: existingStore.contract.contractStatus,
          notes: existingStore.contract.notes || '',
        },
        bankAccount: {
          bankCode: existingStore.bankAccount.bankCode,
          bankName: existingStore.bankAccount.bankName,
          accountNumber: existingStore.bankAccount.accountNumber,
          accountHolder: existingStore.bankAccount.accountHolder,
        },
        openingDate: existingStore.openingDate
          ? formatDateForInput(existingStore.openingDate)
          : '',
        operatingHours: existingStore.operatingHours || '',
      });
      setIsBusinessNumberValid(true); // 기존 매장은 이미 검증됨
    }
  }, [mode, existingStore]);

  const handleChange = (
    section: keyof StoreFormData,
    field: string,
    value: string
  ) => {
    if (section === 'name' || section === 'code' || section === 'status' || section === 'openingDate' || section === 'operatingHours') {
      setFormData((prev) => ({ ...prev, [section]: value }));
    } else {
      setFormData((prev) => {
        const sectionData = prev[section];
        if (typeof sectionData === 'object' && sectionData !== null) {
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [field]: value,
            },
          };
        }
        return prev;
      });
    }

    // 사업자번호 변경 시 검증 상태 초기화
    if (section === 'business' && field === 'businessNumber') {
      setIsBusinessNumberValid(null);
    }
  };

  const handleBankChange = (bankCode: string) => {
    const bank = BANKS.find((b) => b.code === bankCode);
    setFormData((prev) => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        bankCode,
        bankName: bank?.name || '',
      },
    }));
  };

  const handleCheckBusinessNumber = async () => {
    const businessNumber = formData.business.businessNumber.trim();
    if (!businessNumber) {
      toast.error('사업자번호를 입력해주세요.');
      return;
    }

    try {
      const isDuplicate = await checkBusinessNumber.mutateAsync({
        businessNumber,
        excludeId: mode === 'edit' ? id : undefined,
      });

      if (isDuplicate) {
        setIsBusinessNumberValid(false);
        toast.error('이미 등록된 사업자번호입니다.');
      } else {
        setIsBusinessNumberValid(true);
        toast.success('사용 가능한 사업자번호입니다.');
      }
    } catch (error) {
      toast.error('사업자번호 확인에 실패했습니다.');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('매장명을 입력해주세요.');
      return false;
    }
    if (!formData.address.zipCode.trim()) {
      toast.error('우편번호를 입력해주세요.');
      return false;
    }
    if (!formData.address.address.trim()) {
      toast.error('주소를 입력해주세요.');
      return false;
    }
    if (!formData.owner.name.trim()) {
      toast.error('점주명을 입력해주세요.');
      return false;
    }
    if (!formData.owner.phone.trim()) {
      toast.error('점주 연락처를 입력해주세요.');
      return false;
    }
    if (!formData.business.businessNumber.trim()) {
      toast.error('사업자등록번호를 입력해주세요.');
      return false;
    }
    if (mode === 'create' && isBusinessNumberValid !== true) {
      toast.error('사업자번호 중복 확인을 해주세요.');
      return false;
    }
    if (!formData.business.businessName.trim()) {
      toast.error('상호명을 입력해주세요.');
      return false;
    }
    if (!formData.business.representativeName.trim()) {
      toast.error('대표자명을 입력해주세요.');
      return false;
    }
    if (!formData.contract.contractDate) {
      toast.error('계약일을 선택해주세요.');
      return false;
    }
    if (!formData.contract.expirationDate) {
      toast.error('계약 만료일을 선택해주세요.');
      return false;
    }
    if (!formData.bankAccount.bankCode) {
      toast.error('은행을 선택해주세요.');
      return false;
    }
    if (!formData.bankAccount.accountNumber.trim()) {
      toast.error('계좌번호를 입력해주세요.');
      return false;
    }
    if (!formData.bankAccount.accountHolder.trim()) {
      toast.error('예금주를 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createStore.mutateAsync(formData);
        toast.success('매장이 등록되었습니다.');
      } else {
        await updateStore.mutateAsync({ id: id!, data: formData });
        toast.success('매장 정보가 수정되었습니다.');
      }
      navigate('/staff/stores');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '저장에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'edit' && isLoadingStore) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/staff/stores')}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <ArrowLeftOutlined />
        </button>
        <h1 className="text-2xl font-bold text-txt-main">
          {mode === 'create' ? '매장 등록' : '매장 수정'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                매장명 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', '', e.target.value)}
                placeholder="매장명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                매장 코드
              </label>
              <Input
                value={formData.code}
                onChange={(e) => handleChange('code', '', e.target.value)}
                placeholder="POS 연동용 코드"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                상태
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  handleChange('status', '', e.target.value as StoreStatus)
                }
                className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(STORE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                오픈일
              </label>
              <Input
                type="date"
                value={formData.openingDate}
                onChange={(e) => handleChange('openingDate', '', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                운영 시간
              </label>
              <Input
                value={formData.operatingHours}
                onChange={(e) =>
                  handleChange('operatingHours', '', e.target.value)
                }
                placeholder="예: 11:00-22:00"
              />
            </div>
          </div>
        </Card>

        {/* 주소 정보 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">주소 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                우편번호 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.address.zipCode}
                onChange={(e) => handleChange('address', 'zipCode', e.target.value)}
                placeholder="우편번호"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                지역
              </label>
              <select
                value={formData.address.region}
                onChange={(e) =>
                  handleChange('address', 'region', e.target.value as Region)
                }
                className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-txt-main mb-1">
                주소 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.address.address}
                onChange={(e) => handleChange('address', 'address', e.target.value)}
                placeholder="주소를 입력하세요"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-txt-main mb-1">
                상세주소
              </label>
              <Input
                value={formData.address.addressDetail}
                onChange={(e) =>
                  handleChange('address', 'addressDetail', e.target.value)
                }
                placeholder="상세주소를 입력하세요"
              />
            </div>
          </div>
        </Card>

        {/* 가맹점주 정보 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">가맹점주 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                점주명 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.owner.name}
                onChange={(e) => handleChange('owner', 'name', e.target.value)}
                placeholder="점주명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                연락처 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.owner.phone}
                onChange={(e) => handleChange('owner', 'phone', e.target.value)}
                placeholder="010-1234-5678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                이메일
              </label>
              <Input
                type="email"
                value={formData.owner.email}
                onChange={(e) => handleChange('owner', 'email', e.target.value)}
                placeholder="이메일 주소"
              />
            </div>
          </div>
        </Card>

        {/* 사업자 정보 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">사업자 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                사업자등록번호 <span className="text-critical">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.business.businessNumber}
                  onChange={(e) =>
                    handleChange('business', 'businessNumber', e.target.value)
                  }
                  placeholder="123-45-67890"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckBusinessNumber}
                  disabled={checkBusinessNumber.isPending}
                >
                  {isBusinessNumberValid === true ? (
                    <CheckOutlined className="text-success" />
                  ) : (
                    '중복확인'
                  )}
                </Button>
              </div>
              {isBusinessNumberValid === false && (
                <p className="text-sm text-critical mt-1">
                  이미 등록된 사업자번호입니다.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                상호명 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.business.businessName}
                onChange={(e) =>
                  handleChange('business', 'businessName', e.target.value)
                }
                placeholder="상호명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                대표자명 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.business.representativeName}
                onChange={(e) =>
                  handleChange('business', 'representativeName', e.target.value)
                }
                placeholder="대표자명을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                업종
              </label>
              <Input
                value={formData.business.businessType}
                onChange={(e) =>
                  handleChange('business', 'businessType', e.target.value)
                }
                placeholder="업종"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                업태
              </label>
              <Input
                value={formData.business.businessCategory}
                onChange={(e) =>
                  handleChange('business', 'businessCategory', e.target.value)
                }
                placeholder="업태"
              />
            </div>
          </div>
        </Card>

        {/* 계약 정보 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">계약 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                계약일 <span className="text-critical">*</span>
              </label>
              <Input
                type="date"
                value={formData.contract.contractDate}
                onChange={(e) =>
                  handleChange('contract', 'contractDate', e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                만료일 <span className="text-critical">*</span>
              </label>
              <Input
                type="date"
                value={formData.contract.expirationDate}
                onChange={(e) =>
                  handleChange('contract', 'expirationDate', e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                계약 상태
              </label>
              <select
                value={formData.contract.contractStatus}
                onChange={(e) =>
                  handleChange(
                    'contract',
                    'contractStatus',
                    e.target.value as ContractStatus
                  )
                }
                className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-txt-main mb-1">
                비고
              </label>
              <textarea
                value={formData.contract.notes}
                onChange={(e) => handleChange('contract', 'notes', e.target.value)}
                placeholder="계약 관련 메모"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* 계좌 정보 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">계좌 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                은행 <span className="text-critical">*</span>
              </label>
              <select
                value={formData.bankAccount.bankCode}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">은행 선택</option>
                {BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                계좌번호 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.bankAccount.accountNumber}
                onChange={(e) =>
                  handleChange('bankAccount', 'accountNumber', e.target.value)
                }
                placeholder="계좌번호를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-main mb-1">
                예금주 <span className="text-critical">*</span>
              </label>
              <Input
                value={formData.bankAccount.accountHolder}
                onChange={(e) =>
                  handleChange('bankAccount', 'accountHolder', e.target.value)
                }
                placeholder="예금주명"
              />
            </div>
          </div>
        </Card>

        {/* 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/staff/stores')}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Spinner size="sm" />
            ) : mode === 'create' ? (
              '등록'
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
