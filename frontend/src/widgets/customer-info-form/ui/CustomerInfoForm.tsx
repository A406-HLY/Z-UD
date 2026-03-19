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
import { Customer } from '@/entities/customer/model/types';
import { Card, Input, Label, Select, Button } from '@/shared/ui';

/**
 * @widget CustomerInfoForm
 * 고객의 기초 정보를 입력받는 폼 위젯입니다.
 * (Why) 사용자의 입력 편의성과 데이터 정확성을 위해 실시간 포맷팅 및 전역 상담 ID 관리 로직을 구현합니다.
 */
export const CustomerInfoForm = () => {
  const dispatch = useAppDispatch();
  
  // (Why) 전역 상태(Redux)에서 고객 정보와 폴링 상태를 직접 구독합니다.
  const form = useAppSelector((state) => state.customer.data);
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);

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
        // (Why) 보유 주택 개수는 음수가 될 수 없으므로 0 미만일 경우 0으로 자동 보정합니다.
        const numericValue = parseInt(value, 10);
        finalValue = isNaN(numericValue) ? '' : Math.max(0, numericValue).toString();
        break;
      default:
        break;
    }

    // (Why) 입력 데이터를 전역 상태로 관리하여 다른 위젯과의 데이터 정합성을 유지합니다.
    dispatch(updateCustomerData({ [field]: finalValue }));
  };

  /**
   * 저장 버튼 클릭 핸들러
   * (Why) 정보를 저장함과 동시에 전역 폴링 상태를 제어하며, 최초 저장 시 상담용 고유 UUID를 생성하여 전역 스토어에 저장합니다.
   */
  const handleSave = () => {
    // (Why) 이미 생성된 상담 ID가 없을 경우에만 신규 UUID를 발급하여 상담의 고유성을 확보합니다.
    if (!form.counselId) {
      const newId = generateUUID();
      dispatch(setCounselId(newId));
      console.log(`[System] New Counsel ID Generated and Dispatched: ${newId}`);
    }
    
    // (Why) 폴링 활성화 상태를 전역으로 토글하여 서류 감지 기능을 시작/중지합니다.
    dispatch(setIsPollingActive(!isPollingActive));
  };

  return (
    <Card className="p-4 bg-[#f8f9fa]">
      <div className="grid grid-cols-12 gap-4 items-end">
        {/* 상담 ID 표시 (읽기 전용 시스템 배너) */}
        {form.counselId && (
          <div className="col-span-12 mb-2 p-2 bg-blue-50 border border-blue-100 rounded flex justify-between items-center transition-all animate-in fade-in slide-in-from-top-1">
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
