import { useState } from 'react';
import { Input, Label, Card, Select } from '@/shared/ui';
import { Customer, INITIAL_CUSTOMER_STATE } from '@/entities/customer/model/types';

/**
 * 고객 기본정보 입력 폼 위젯
 * - 주민등록번호 자동 하이픈 삽입
 * - 근로 형태 토글 버튼 선택 방식
 * - 입력 타입 정교화
 */
export const CustomerInfoForm = () => {
  const [form, setForm] = useState<Customer>(INITIAL_CUSTOMER_STATE);

  const handleChange = (field: keyof Customer, value: string) => {
    let finalValue = value;

    // 1. 주민등록번호 자동 하이픈 로직 (6자리-7자리)
    if (field === 'personalId') {
      const nums = value.replace(/[^0-9]/g, '');
      if (nums.length <= 6) {
        finalValue = nums;
      } else {
        finalValue = `${nums.slice(0, 6)}-${nums.slice(6, 13)}`;
      }
    }

    // 2. 전화번호 자동 하이픈 로직 (010-XXXX-XXXX)
    if (field === 'phoneNumber') {
      const nums = value.replace(/[^0-9]/g, '');
      if (nums.length <= 3) {
        finalValue = nums;
      } else if (nums.length <= 7) {
        finalValue = `${nums.slice(0, 3)}-${nums.slice(3)}`;
      } else {
        finalValue = `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
      }
    }

    // 3. 희망 금액 천 단위 콤마 포맷팅
    if (field === 'desiredAmount') {
      const nums = value.replace(/[^0-9]/g, '');
      if (!nums) {
        finalValue = '';
      } else {
        finalValue = Number(nums).toLocaleString();
      }
    }

    setForm((prev) => ({ ...prev, [field]: finalValue }));
  };

  const employmentOptions = ['직장인', '자영업자', '프리랜서'];

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

        <div className="col-span-4" /> {/* 여백 줄임 */}

        {/* 2행 */}
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="loanPurpose">대출 목적</Label>
          <Input 
            id="loanPurpose" 
            value={form.loanPurpose} 
            onChange={(e) => handleChange('loanPurpose', e.target.value)}
            placeholder="주택구매목적"
          />
        </div>

        <div className="col-span-3 space-y-1.5">
          <Label htmlFor="employmentType">근로 형태</Label>
          <Select
            id="employmentType"
            value={form.employmentType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('employmentType', e.target.value)}
          >
            <option value="" disabled>근로 형태 선택</option>
            {employmentOptions.map((option) => (
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

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="houseCount">보유 주택 개수</Label>
          <div className="relative flex items-center">
            <Input 
              id="houseCount" 
              className="pr-8 text-right"
              type="number"
              value={form.houseCount} 
              onChange={(e) => handleChange('houseCount', e.target.value)}
              placeholder="0"
            />
            <span className="absolute right-3 text-sm text-gray-400">채</span>
          </div>
        </div>
        
        <div className="col-span-2" /> {/* 여백 줄임 */}
      </div>
    </Card>
  );
};
