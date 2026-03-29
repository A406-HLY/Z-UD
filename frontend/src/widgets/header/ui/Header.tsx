import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { CURRENT_WORK_NAME } from '@/shared/config/app-constants';
import { SHARED_LABELS } from '@/shared/config/ui-labels';
import { updateStepStatus, setOcrData } from '@/entities/audit/model/audit.slice';
import { fetchVerificationResult } from '@/entities/verification/api/verification.api';

/**
 * @widget Header
 * 대역 상단 헤더 위젯입니다.
 */
export const Header = () => {
  const user = useAppSelector((state) => state.auth.user);
  const consultationId = useAppSelector((state) => state.customer.data.consultationId);
  const dispatch = useAppDispatch();

  const handleMockTrigger = async () => {
    console.log('[MOCK] 🚀 Triggered! consultationId:', consultationId || 'TEMP_ID');
    dispatch(updateStepStatus({ step: 'ocr', status: 'LOADING' }));
    
    try {
      console.log('[MOCK] 🛰️ Fetching verification results...');
      const response = await fetchVerificationResult(consultationId || 'TEMP_ID');
      console.log('[MOCK] ✅ Data fetched successfully:', response);
      
      // (S14-FIX) Mapper가 { data: { ... } } 구조를 기대하므로, 
      // 껍질을 함부로 벗기지 않고 전체 응답 객체를 리덕스에 저장합니다.
      console.log('[MOCK] 💾 Dispatching to Redux Store...');
      dispatch(setOcrData(response));
      dispatch(updateStepStatus({ step: 'ocr', status: 'SUCCESS' }));
      console.log('[MOCK] ✨ Flow Completed Successfully');
    } catch (error) {
      console.error('[MOCK] ❌ Failed to trigger mock signal:', error);
      dispatch(updateStepStatus({ step: 'ocr', status: 'ERROR' }));
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-gray-900">
          {user?.branchName || SHARED_LABELS.BRANCH_NONE}
        </h1>
        <div className="h-4 w-px bg-gray-300" />
        <span className="text-sm font-medium text-gray-600">
          {SHARED_LABELS.WORK_PREFIX} {CURRENT_WORK_NAME}
        </span>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-500 font-normal">{SHARED_LABELS.USER_NAME_LABEL}</span>
          <span className="font-semibold text-gray-800">{user?.name || '---'}님</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-500 font-normal">{SHARED_LABELS.EMPLOYEE_ID_LABEL}</span>
          <span className="font-semibold text-gray-800">{user?.employeeNumber || '---'}</span>
        </div>
      </div>
    </header>
  );
};

