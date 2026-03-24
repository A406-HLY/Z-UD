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
import { validateCustomer, isFieldComplete } from '@/entities/customer/model/validation';
import { calculateCustomerProgress } from '@/entities/customer/model/utils';
import { generateUUID } from '@/shared/lib/utils/id-utils';
import { Customer } from '@/entities/customer/model/types';
import { createConsultation } from '@/entities/customer/api/customer.api';

/** 
 * (P3) switch 문을 대체하기 위한 필드별 포맷터 매핑 객체입니다. 
 * (Why) 새로운 도메인 필드가 추가되어도 switch 문 확장 없이 매핑 추가만으로 대응이 가능합니다.
 */
const FIELD_FORMATTERS: Partial<Record<string, (val: string, prev?: string) => string>> = {
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
  const [touched, setTouched] = useState<Partial<Record<keyof Customer, boolean>>>({});

  const combinedErrors: Partial<Record<keyof Customer, boolean>> = {
    ...errors, // handleSave 시점에 결정된 명시적 에러들
  };

  // (P2) 실시간 성공 및 에러 상태 도출
  const successFields: Partial<Record<keyof Customer, boolean>> = {};

  (Object.keys(form) as Array<keyof Customer>).forEach((field) => {
    // 1. 에러 판단: 한 번이라도 방문(touched)했던 필드에 대해 실시간 검증 수행
    // (P2) 값이 불완전한 상태라면 바로 에러 표시 (사용자 피드백 반영)
    if (touched[field] && !isFieldComplete(field, form[field])) {
      combinedErrors[field] = true;
    }

    // 2. 성공 판단: 비즈니스 규칙에 맞게 완성되었는지 체크
    if (isFieldComplete(field, form[field])) {
      successFields[field] = true;
    }
  });

  const { percentage: progressPercentage, firstEmptyField } = calculateCustomerProgress(form);

  /** 필드 변경 핸들러 */
  const handleChange = (field: keyof Customer, value: string, formatType?: string) => {
    let finalValue = value;
    
    // (P3) 매핑 객체를 활용한 포맷터 호출 (삭제 감지를 위해 이전 값인 form[field] 전달)
    if (formatType && FIELD_FORMATTERS[formatType]) {
      finalValue = FIELD_FORMATTERS[formatType]!(value, form[field] || '');
    }

    // (P2) 값이 입력되면 해당 필드의 에러 상태 즉시 해제
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }

    dispatch(updateCustomerData({ [field]: finalValue }));
  };

  /** 포커스 아웃(Blur) 핸들러 */
  const handleBlur = (field: keyof Customer) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  /** 저장/제출 핸들러 (상담 등록 API 연동) */
  const handleSave = async () => {
    const validationErrors = validateCustomer(form);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.warn('[System] Validation Failed. Please check red-bordered fields.');
      return;
    }

    // (Why) 상담 ID가 없는 경우 새로 생성하고, 즉시 백엔드 서버에 등록을 시도합니다.
    let currentCounselId = form.counselId;
    if (!currentCounselId) {
      currentCounselId = generateUUID();
      dispatch(setCounselId(currentCounselId));
    }

    try {
      // (Why) 백엔드 /consultations 엔드포인트에 상담 정보를 저장하여 에이전트 연동의 정합성을 확보합니다.
      const response = await createConsultation({ ...form, counselId: currentCounselId });
      
      if (response.success) {
        console.log('[System] Consultation registered successfully:', currentCounselId);
        dispatch(setIsPollingActive(!isPollingActive));
      } else {
        console.error('[System] Failed to register consultation:', response.error?.message);
        alert('상담 등록에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('[System] Error during consultation registration:', error);
      alert('서버 통신 중 오류가 발생했습니다.');
    }
  };

  return {
    form,
    errors: combinedErrors,
    successFields,
    touched,
    isPollingActive,
    progressPercentage,
    firstEmptyField,
    handleChange,
    handleBlur,
    handleSave,
  };
};
