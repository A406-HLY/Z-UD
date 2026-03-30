import { AuditSummaryItem, HouseAuditResponseDto, MyDataResDto } from './types';

/**
 * @entity Audit
 * 백엔드 심사 데이터를 클라이언트 UI 모델로 변환하는 매퍼입니다.
 */

/**
 * 주택 심사 결과를 UI 리스트 아이템 배열로 변환합니다.
 * (Why) 백엔드 응답 구조에 의존하지 않고, UI 위젯이 일관되게 렌더링할 수 있도록 3단계 로직을 분리해 매핑합니다.
 */
export const mapHouseAuditToUiModel = (data: HouseAuditResponseDto['data']): AuditSummaryItem[] => {
  if (!data) return []; // (Safety) 데이터가 비어있을 경우 빈 배열 반환
  const items: AuditSummaryItem[] = [];

  const isSuccess = data.supportedHouseType && data.nearestBranch?.currentBranchIsNearest;

  // 1. 주택 심사 통합 (시세, 거리, 위반 등)
  items.push({
    id: 'house-audit',
    title: '주택 담보물 심사',
    summary: data.supportedHouseType && data.housePrice
      ? `${data.housePrice.price?.toLocaleString() || 0}만원 (${data.housePrice.priceType || '시세'})`
      : '시세 정보 없음',
    status: isSuccess ? 'SUCCESS' : 'ERROR',
    message: isSuccess ? undefined : '심사 불가능: 해당 물건지는 당행에서 취급하지 않거나 관할 지점 범위를 벗어납니다.',
    details: data,
  });

  return items;
};

/**
 * 마이데이터 조회 결과를 UI 리스트 아이템 배열로 변환합니다.
 * (Why) 신용 등급과 기대출 현황을 각각 독립된 UI 섹션으로 분리하여 관리합니다.
 */
export const mapMyDataToUiModel = (dto: Partial<MyDataResDto>): AuditSummaryItem[] => {
  const items: AuditSummaryItem[] = [];

  // 1. 신용등급 섹션
  items.push({
    id: 'credit-rating',
    title: '신용등급 조회',
    summary: dto.ratingName ? `${dto.ratingName} 등급` : '조회 중...',
    status: 'SUCCESS',
    details: { ratingName: dto.ratingName, userId: dto.userId },
  });

  // 2. 기존 대출 내역 섹션
  // (Why) SSE 점진적 업데이트 시 loanProducts가 아직 없을 수 있으므로 방어 코드를 추가합니다.
  items.push({
    id: 'loan-history',
    title: '기존 대출 내역',
    summary: dto.loanProducts 
      ? `${dto.loanProducts.length}건 / 잔액 ${dto.totalLoanBalance?.toLocaleString() || 0}원` 
      : '조회 중...',
    status: 'SUCCESS',
    details: dto, // (Why) LoanDetail 컴포넌트에서 전체 product 목록이 필요하므로 dto 전체를 넘깁니다.
  });

  return items;
};
