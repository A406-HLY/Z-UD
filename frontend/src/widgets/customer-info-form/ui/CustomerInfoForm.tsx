import { useState } from 'react';
import { Card, Input, Label, Select, Button } from '@/shared/ui';
import { Customer, INITIAL_CUSTOMER_STATE } from '@/entities/customer/model/types';
import { 
  formatPersonalId, 
  formatPhoneNumber, 
  formatCurrency,
  formatName
} from '@/shared/lib/utils/format-utils';
import { EMPLOYMENT_TYPES, LOAN_PURPOSE_OPTIONS } from '@/entities/customer/model/customer.constants';

interface CustomerInfoFormProps {
  isPollingActive: boolean;
  onTogglePolling: () => void;
}

/**
 * @widget CustomerInfoForm
 * 고객의 기초 정보를 입력받는 폼 위젯입니다.
 * (Why) 사용자의 입력 편의성과 데이터 정확성을 위해 실시간 포맷팅 및 유효성 검사 로직을 포함합니다.
 */
export const CustomerInfoForm = ({ isPollingActive, onTogglePolling }: CustomerInfoFormProps) => {
  const [form, setForm] = useState<Customer>(INITIAL_CUSTOMER_STATE);

  /** 
   * 입력 필드 변경 핸들러
   * (Why) 각 필드에 적절한 포맷터 및 유효성 검사(숫자 방지, 음수 방지 등)를 적용하여 데이터 무결성을 확보합니다.
   */
  const handleChange = (field: keyof Customer, value: string) => {
    let finalValue = value;

    // (Why) 필드별 특화된 포맷팅 및 검증 로직을 분기 처리합니다.
    switch (field) {
      case 'name':
        // (Why) 공통 포맷터(formatName)를 호출하여 한글/영문 외의 입력을 필터링합니다.
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
        // (Why) 보유 주택 개수는 음수가 될 수 없으므로 0 미만일 경우 0으로 보정합니다.
        const numericValue = parseInt(value, 10);
        finalValue = isNaN(numericValue) ? '' : Math.max(0, numericValue).toString();
        break;
      default:
        break;
    }

    setForm((prev) => ({ ...prev, [field]: finalValue }));
  };

  return (
    <Card className="p-4 bg-[#f8f9fa]">
      <div className="grid grid-cols-12 gap-4 items-end">
        {/* 1행 */}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">고객 성함</Label>
          <Input 
            id="name" 
            autoComplete="name"
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
            value={form.loanPurpose}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('loanPurpose', e.target.value)}
          >
            <option value="" disabled>대출 목적 선택</option>
            {LOAN_PURPOSE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="col-span-3 space-y-1.5">
          <Label htmlFor="employmentType">근로 형태</Label>
          <Select
            id="employmentType"
            value={form.employmentType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('employmentType', e.target.value)}
          >
            <option value="" disabled>근로 형태 선택</option>
            {EMPLOYMENT_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="col-span-3 space-y-1.5">
          <Label htmlFor="desiredAmount">희망 금액</Label>
          <div className="relative flex items-center">
            <Input 
              id="desiredAmount" 
              className="pr-8 text-right font-bold text-[#004b93]"
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
              className={`text-[11px] px-3 ${isPollingActive ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-[#004b93] text-white'}`}
              onClick={onTogglePolling}
            >
              {isPollingActive ? '중지' : '서류 감지'}
            </Button>
          </div>
        </div>
        
        <div className="col-span-1" />
      </div>
    </Card>
  );
};
