import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  formatName,
  formatPersonalId,
  formatPhoneNumber,
  formatCurrency
} from '@/shared/lib/utils/format-utils';
import {
  setConsultationId,
  setIsPollingActive,
  setIsSubmitting,
  updateCustomerData
} from '@/entities/customer/model/slice';
import { validateCustomer, isFieldComplete } from '@/entities/customer/model/validation';
import { calculateCustomerProgress } from '@/entities/customer/model/utils';
import { Customer } from '@/entities/customer/model/types';
import { createConsultation } from '@/entities/customer/api/customer.api';

const FIELD_FORMATTERS: Partial<Record<string, (val: string, prev?: string) => string>> = {
  name: formatName,
  residentRegistrationNumber: formatPersonalId,
  phoneNumber: formatPhoneNumber,
  currency: formatCurrency,
  number: (val) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? '' : Math.max(0, num).toString();
  }
};

export const useCustomerForm = () => {
  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => state.customer.data);
  const isPollingActive = useAppSelector((state) => state.customer.isPollingActive);
  const isSubmitting = useAppSelector((state) => state.customer.isSubmitting);

  const [errors, setErrors] = useState<Partial<Record<keyof Customer, boolean>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Customer, boolean>>>({});

  const combinedErrors: Partial<Record<keyof Customer, boolean>> = {
    ...errors,
  };

  const successFields: Partial<Record<keyof Customer, boolean>> = {};

  (Object.keys(form) as Array<keyof Customer>).forEach((field) => {
    if (touched[field] && !isFieldComplete(field, form[field])) {
      combinedErrors[field] = true;
    }

    if (isFieldComplete(field, form[field])) {
      successFields[field] = true;
    }
  });

  const { percentage: progressPercentage, firstEmptyField } = calculateCustomerProgress(form);

  const handleChange = (field: keyof Customer, value: string, formatType?: string) => {
    let finalValue = value;

    if (formatType && FIELD_FORMATTERS[formatType]) {
      finalValue = FIELD_FORMATTERS[formatType]!(value, form[field] || '');
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: false }));
    }

    dispatch(updateCustomerData({ [field]: finalValue }));
  };

  const handleBlur = (field: keyof Customer) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async () => {
    if (isPollingActive) {
      dispatch(setIsPollingActive(false));
      return;
    }

    const validationErrors = validateCustomer(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      return;
    }

    try {
      dispatch(setIsSubmitting(true));

      const response = await createConsultation(form);

      if (response.success && response.data) {

        const newConsultationId = response.data.id;
        dispatch(setConsultationId(newConsultationId));

        dispatch(setIsPollingActive(!isPollingActive));
      } else {

        alert('상담 등록에 실패했습니다. 다시 시도해 주세요.');
      }
    } catch (error) {

      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      dispatch(setIsSubmitting(false));
    }
  };

  return {
    form,
    errors: combinedErrors,
    successFields,
    touched,
    isPollingActive,
    isSubmitting,
    progressPercentage,
    firstEmptyField,
    handleChange,
    handleBlur,
    handleSave,
  };
};