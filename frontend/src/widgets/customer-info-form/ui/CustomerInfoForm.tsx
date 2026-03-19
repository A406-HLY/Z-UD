import { useState } from 'react';
import { 
  formatPersonalId, 
  formatPhoneNumber, 
  formatCurrency,
  formatName
} from '@/shared/lib/utils/format-utils';
import { generateUUID } from '@/shared/lib/utils/id-utils';
import { EMPLOYMENT_TYPES, LOAN_PURPOSE_OPTIONS } from '@/entities/customer/model/customer.constants';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setCounselId, setIsPollingActive, updateCustomerData } from '@/entities/customer/model/slice';
import { validateCustomer } from '@/entities/customer/model/validation';
import { Customer } from '@/entities/customer/model/types';
import { Card, Input, Label, Select, Button } from '@/shared/ui';

/**
 * @widget CustomerInfoForm
 * 고객의 기초 정보를 입력받는 폼 위젯입니다.
 * (Why) 사용자의 입력 편의성과 데이터 정확성을 위해 실시간 포맷팅 및 시각적 유효성 검사 로직을 구현합니다.
 */
export const CustomerInfoForm = () => {
  const dispatch = useAppDispatch();
  
  // (Why) 전역 상태(Redux)에서 고객 정보와 폴링 상태를 직접 구독합니다.
  const form = useAppSelector((state) => state.customer.data);
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

  // (Why) 각 필드별 에러 상태를 로컬로 관리하여 실시간 시각적 피드백(빨간 테두리)을 제공합니다.
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, boolean>>>({});

  /** 
   * 입력 필드 변경 핸들러
   * (Why) 각 필드에 적합한 포맷터를 적용한 후 전역 스토어(Redux)에 즉각 반영합니다.
   */
  const handleChange = (field: keyof Customer, value: string) => {
    let finalValue = value;

    switch (field) {
      case 'name':
        finalValue = formatName(value);
        break;
      case 'personalId':
        finalValue = formatPersonalId(value);
        break;
      case 'phoneNumber':
        finalValue = formatPhoneNumber(value);
        break;
      case 'desiredAmount':
        finalValue = formatCurrency(value);
        break;
      case 'houseCount':
        const numericValue = parseInt(value, 10);
        finalValue = isNaN(numericValue) ? '' : Math.max(0, numericValue).toString();
        break;
      default:
        break;
    }

    // (Why) 사용자가 값을 수정하기 시작하면 해당 필드의 에러 표시를 실시간으로 제거합니다.
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }

    dispatch(updateCustomerData({ [field]: finalValue }));
  };

  /**
   * 저장 버튼 클릭 핸들러
   * (Why) 필수 정보 누락 시 시각적 경고를 표시하고 상담 ID 생성을 차단하여 데이터 정합성을 유지합니다.
   */
  const handleSave = () => {
    // (Why) 분리된 유효성 검증 로직을 사용하여 모든 필수 필드가 채워졌는지 확인합니다.
    const validationErrors = validateCustomer(form);
    
    if (Object.keys(validationErrors).length > 0) {
      // (Why) 에러 맵을 상태에 업데이트하여 UI(Input/Select)의 테두리 색상을 변경합니다.
      setErrors(validationErrors);
      console.warn('[System] Validation Failed. Please check red-bordered fields.');
      return;
    }

    // (Why) 유효성 검사 통과 시에만 신규 UUID를 발급하여 상담 세션을 시작합니다.
    if (!form.counselId) {
      const newId = generateUUID();
      dispatch(setCounselId(newId));
    }
    
    dispatch(setIsPollingActive(!isPollingActive));
  };

  return (
    <Card className="p-4 bg-[#f8f9fa]">
      <div className="grid grid-cols-12 gap-4 items-end">
        {/* 상담 ID 표시 */}
        {form.counselId && (
          <div className="col-span-12 mb-2 p-2 bg-blue-50 border border-blue-100 rounded flex justify-between items-center animate-in fade-in slide-in-from-top-1">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Counsel_ID</span>
            <span className="text-[11px] text-blue-700 font-mono font-bold leading-none">{form.counselId}</span>
          </div>
        )}

        {/* 1행 */}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">고객 성함</Label>
          <Input 
            id="name" 
            autoComplete="name"
            isError={errors.name}
            value={form.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="이름 입력"
          />
        </div>
        
        <div className="col-span-3 space-y-1.5">
          <Label htmlFor="personalId">주민등록번호</Label>
          <Input 
            id="personalId" 
            maxLength={14}
            isError={errors.personalId}
            value={form.personalId} 
            onChange={(e) => handleChange('personalId', e.target.value)}
            placeholder="991209-1234567"
          />
        </div>

        <div className="col-span-3 space-y-1.5">
          <Label htmlFor="phoneNumber">전화번호</Label>
          <Input 
            id="phoneNumber"
            type="tel"
            autoComplete="tel"
            isError={errors.phoneNumber}
            value={form.phoneNumber} 
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="010-1234-5678"
          />
        </div>

        <div className="col-span-4" />

        {/* 2행 */}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="loanPurpose">대출 목적</Label>
          <Select
            id="loanPurpose"
            isError={errors.loanPurpose}
            value={form.loanPurpose}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('loanPurpose', e.target.value)}
          >
            <option value="" disabled>대출 목적 선택</option>
            {LOAN_PURPOSE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        </div>

        <div className="col-span-3 space-y-1.5">
          <Label htmlFor="employmentType">근로 형태</Label>
          <Select
            id="employmentType"
            isError={errors.employmentType}
            value={form.employmentType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('employmentType', e.target.value)}
          >
            <option value="" disabled>근로 형태 선택</option>
            {EMPLOYMENT_TYPES.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </Select>
        </div>

        <div className="col-span-3 space-y-1.5">
          <Label htmlFor="desiredAmount">희망 금액</Label>
          <div className="relative flex items-center">
            <Input 
              id="desiredAmount" 
              className="pr-8 text-right font-bold text-[#004b93]"
              isError={errors.desiredAmount}
              value={form.desiredAmount} 
              onChange={(e) => handleChange('desiredAmount', e.target.value)}
              placeholder="123,456,789"
            />
            <span className="absolute right-3 text-sm text-gray-400">원</span>
          </div>
        </div>

        <div className="col-span-3 space-y-1.5 font-bold">
          <Label htmlFor="houseCount">보유 주택 개수</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Input 
                id="houseCount" 
                className="pr-6 text-right"
                isError={errors.houseCount}
                type="number"
                min="0"
                value={form.houseCount} 
                onChange={(e) => handleChange('houseCount', e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-2 text-xs text-gray-400">채</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant={isPollingActive ? 'outline' : 'primary'}
              className={`text-[11px] px-3 w-20 transition-all ${
                isPollingActive ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-[#004b93] text-white'
              }`}
              onClick={handleSave}
            >
              {isPollingActive ? '중지' : '저장'}
            </Button>
          </div>
        </div>
        
        <div className="col-span-1" />
      </div>
    </Card>
  );
};
