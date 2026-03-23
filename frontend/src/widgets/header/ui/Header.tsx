import { useAppSelector } from '@/app/store/hooks';
import { CURRENT_WORK_NAME } from '@/shared/config/app-constants';
import { SHARED_LABELS } from '@/shared/config/ui-labels';

/**
 * @widget Header
 * 대역 상단 헤더 위젯입니다.
 * (Why) 지점 정보, 업무 정보, 사용자 접속 정보를 시각화하며, 업무 명칭은 전역 설정을 따릅니다.
 */
export const Header = () => {
  const user = useAppSelector((state) => state.auth.user);

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
