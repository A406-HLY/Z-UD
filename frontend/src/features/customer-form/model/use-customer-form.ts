import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { 
  formatName, 
  formatPersonalId, 
  formatPhoneNumber, 
  formatCurrency 
} from '@/shared/lib/utils/format-utils';
import { 
  setCounselId, 
  setIsPollingActive, 
  updateCustomerData 
} from '@/entities/customer/model/slice';
import { validateCustomer } from '@/entities/customer/model/validation';
import { calculateCustomerProgress } from '@/entities/customer/model/utils';
import { generateUUID } from '@/shared/lib/utils/id-utils';
import { Customer } from '@/entities/customer/model/types';

/** 
 * (P3) switch 문을 대체하기 위한 필드별 포맷터 매핑 객체입니다. 
 * (Why) 새로운 도메인 필드가 추가되어도 switch 문 확장 없이 매핑 추가만으로 대응이 가능합니다.
 */
const FIELD_FORMATTERS: Partial<Record<string, (val: string) => string>> = {
  name: formatName,
  personalId: formatPersonalId,
  phoneNumber: formatPhoneNumber,
  currency: formatCurrency,
  number: (val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? '' : Math.max(0, num).toString();
  }
};

/**
 * @feature customer-form
 * 고객 정보 입력 폼의 상태 관리 및 비즈니스 로직을 담당하는 커스텀 훅입니다.
 * (Why) UI 컴포넌트(Widgets)에서 복잡한 포맷팅, 유효성 검사, 전역 상태 연동 로직을 분리하여 유지보수성을 높입니다.
 */
export const useCustomerForm = () => {
  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => state.customer.data);
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);
  
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, boolean>>>({});

  const { percentage: progressPercentage, firstEmptyField } = calculateCustomerProgress(form);

  /** 필드 변경 핸들러 */
  const handleChange = (field: keyof Customer, value: string, formatType?: string) => {
    let finalValue = value;
    
    // (P3) 매핑 객체를 활용한 포맷터 호출
    if (formatType && FIELD_FORMATTERS[formatType]) {
      finalValue = FIELD_FORMATTERS[formatType]!(value);
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }

    dispatch(updateCustomerData({ [field]: finalValue }));
  };

  /** 저장/제출 핸들러 */
  const handleSave = () => {
    const validationErrors = validateCustomer(form);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.warn('[System] Validation Failed. Please check red-bordered fields.');
      return;
    }

    if (!form.counselId) {
      dispatch(setCounselId(generateUUID()));
    }
    
    dispatch(setIsPollingActive(!isPollingActive));
  };

  return {
    form,
    errors,
    isPollingActive,
    progressPercentage,
    firstEmptyField,
    handleChange,
    handleSave,
  };
};
