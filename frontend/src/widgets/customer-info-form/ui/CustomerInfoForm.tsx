import { useState } from 'react';
import { clsx } from 'clsx';
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
      case 'houseCount': {
        const numericValue = parseInt(value, 10);
        finalValue = isNaN(numericValue) ? '' : Math.max(0, numericValue).toString();
        break;
      }
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

  // (Why) 7개의 필수 필드가 얼마나 채워졌는지 진척도를 계산합니다.
  const requiredFields: (keyof Customer)[] = [
    'name', 'personalId', 'phoneNumber', 'loanPurpose', 
    'employmentType', 'desiredAmount', 'houseCount'
  ];
  const filledCount = requiredFields.filter(field => !!form[field]).length;
  const progressPercentage = Math.round((filledCount / requiredFields.length) * 100);

  // (Why) 다음에 입력해야 할 첫 번째 빈 필드를 찾아 시각적 가이드를 제공합니다.
  const firstEmptyField = requiredFields.find(field => !form[field]);

  return (
    <Card className={clsx(
      "transition-all duration-300 ease-in-out border-l-4 rounded-none",
      isPollingActive ? "p-2.5 bg-white border-l-slate-700 shadow-sm" : "p-4 bg-[#f8f9fa] border-l-transparent shadow-sm"
    )}>
      {isPollingActive ? (
        // [Summary Mode] 저장 후 정보를 텍스트로 요약해서 보여줌
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">성함</span>
              <span className="font-bold text-slate-900">{form.name || '-'}</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">주민번호</span>
              <span className="font-mono text-slate-600">{form.personalId || '-'}</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">연락처</span>
              <span className="text-slate-600">{form.phoneNumber || '-'}</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">대출목적</span>
              <span className="text-slate-600">{form.loanPurpose || '-'}</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">근로형태</span>
              <span className="text-slate-600">{form.employmentType || '-'}</span>
            </div>
            <div className="w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">희망금액</span>
              <span className="font-bold text-slate-900">{form.desiredAmount || '0'}</span>
              <span className="text-[10px] text-slate-400">원</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-[11px] px-4 border-slate-200 text-slate-500 rounded-none hover:bg-slate-50 hover:text-slate-900 transition-colors bg-white font-bold"
              onClick={handleSave}
            >
              정보 수정
            </Button>
          </div>
        </div>
      ) : (
        // [Edit Mode] 기존 인라인 라벨 입력 폼
        <div className="flex flex-wrap gap-x-10 gap-y-4 items-center animate-in fade-in zoom-in-95 duration-300">
          {/* 상담 ID 표시 */}
          {form.counselId && (
            <div className="w-full mb-1 p-2 bg-slate-100 border border-slate-200 rounded-none flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Counsel_Session_ID</span>
              <span className="text-[11px] text-slate-700 font-mono font-bold leading-none">{form.counselId}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Label htmlFor="name" className="text-xs font-bold text-slate-500 w-16 text-right shrink-0">고객 성함</Label>
            <Input 
              id="name" 
              autoFocus
              autoComplete="name"
              isError={errors.name}
              value={form.name} 
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="이름"
              className={clsx(
                "h-10 w-[90px] text-sm transition-all duration-300 rounded-none",
                firstEmptyField === 'name' && "border-slate-800 border-2 bg-slate-50"
              )}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Label htmlFor="personalId" className="text-xs font-bold text-slate-500 w-20 text-right shrink-0">주민번호</Label>
            <Input 
              id="personalId" 
              maxLength={14}
              isError={errors.personalId}
              value={form.personalId} 
              onChange={(e) => handleChange('personalId', e.target.value)}
              placeholder="주민번호 13자리"
              className={clsx(
                "h-10 w-[160px] text-sm transition-all duration-300 rounded-none",
                firstEmptyField === 'personalId' && "border-slate-800 border-2 bg-slate-50"
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="phoneNumber" className="text-xs font-bold text-slate-500 w-16 text-right shrink-0">전화번호</Label>
            <Input 
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              isError={errors.phoneNumber}
              value={form.phoneNumber} 
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="010-0000-0000"
              className={clsx(
                "h-10 w-[150px] text-sm transition-all duration-300 rounded-none",
                firstEmptyField === 'phoneNumber' && "border-slate-800 border-2 bg-slate-50"
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="loanPurpose" className="text-xs font-bold text-slate-500 w-16 text-right shrink-0">대출 목적</Label>
            <Select
              id="loanPurpose"
              isError={errors.loanPurpose}
              value={form.loanPurpose}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('loanPurpose', e.target.value)}
              className={clsx(
                "h-10 w-[240px] text-sm px-2 transition-all duration-300 focus:ring-0 focus:ring-offset-0 rounded-none",
                firstEmptyField === 'loanPurpose' && "border-slate-800 border-2 bg-slate-50"
              )}
            >
              <option value="" disabled>본인의 목적을 선택하세요</option>
              {LOAN_PURPOSE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="employmentType" className="text-xs font-bold text-slate-500 w-16 text-right shrink-0">근로 형태</Label>
            <Select
              id="employmentType"
              isError={errors.employmentType}
              value={form.employmentType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange('employmentType', e.target.value)}
              className={clsx(
                "h-10 w-[180px] text-sm px-2 transition-all duration-300 focus:ring-0 focus:ring-offset-0 rounded-none",
                firstEmptyField === 'employmentType' && "border-slate-800 border-2 bg-slate-50"
              )}
            >
              <option value="" disabled>근로 형태 선택</option>
              {EMPLOYMENT_TYPES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="desiredAmount" className="text-xs font-bold text-slate-500 w-16 text-right shrink-0">희망 금액</Label>
            <div className="relative flex items-center w-[210px]">
              <Input 
                id="desiredAmount" 
                className={clsx(
                  "h-10 w-full pr-7 text-right font-bold text-slate-900 text-sm transition-all duration-300 rounded-none",
                  firstEmptyField === 'desiredAmount' && "border-slate-800 border-2 bg-slate-50"
                )}
                isError={errors.desiredAmount}
                value={form.desiredAmount} 
                onChange={(e) => handleChange('desiredAmount', e.target.value)}
                placeholder="100,000,000"
              />
              <span className="absolute right-2.5 text-[10px] text-slate-400 uppercase font-bold">KRW</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Label htmlFor="houseCount" className="text-xs font-bold text-slate-500 w-16 text-right shrink-0">보유 주택</Label>
            <div className="relative flex items-center w-[100px]">
              <Input 
                id="houseCount" 
                className={clsx(
                  "h-10 w-full pr-6 text-right text-sm transition-all duration-300 rounded-none",
                  firstEmptyField === 'houseCount' && "border-slate-800 border-2 bg-slate-50"
                )}
                isError={errors.houseCount}
                type="number"
                min="0"
                value={form.houseCount} 
                onChange={(e) => handleChange('houseCount', e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-2 text-xs text-slate-400">채</span>
            </div>
          </div>

          <div className="ml-auto relative">
            {/* 진척도 기반 버튼 (Progress Activation) */}
            <Button
              type="button"
              size="sm"
              disabled={progressPercentage < 100}
              className={clsx(
                "h-10 px-10 text-sm font-bold transition-all duration-500 border rounded-none relative overflow-hidden active:scale-95 shadow-sm",
                progressPercentage === 100 
                  ? "bg-slate-800 text-white border-slate-900 hover:bg-slate-900"
                  : "bg-white text-slate-400 border-slate-200 cursor-not-allowed"
              )}
              style={progressPercentage < 100 ? {
                backgroundImage: `linear-gradient(to right, #f1f5f9 ${progressPercentage}%, #ffffff ${progressPercentage}%)`
              } : undefined}
              onClick={handleSave}
            >
              <span className={clsx(
                "relative z-10",
                progressPercentage > 50 && progressPercentage < 100 ? "text-slate-700" : ""
              )}>
                {progressPercentage === 100 ? '스캔본 요청하기' : `스캔본 요청하기 (${progressPercentage}%)`}
              </span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
