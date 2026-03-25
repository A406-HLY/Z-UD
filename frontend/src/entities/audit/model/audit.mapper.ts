import { AuditSummaryItem, HouseAuditResponseDto } from './types';

/**
 * @entity Audit
 * 백엔드 심사 데이터를 클라이언트 UI 모델로 변환하는 매퍼입니다.
 */

/**
 * 주택 심사 결과를 UI 리스트 아이템 배열로 변환합니다.
 * (Why) 백엔드 응답 구조에 의존하지 않고, UI 위젯이 일관되게 렌더링할 수 있도록 3단계 로직을 분리해 매핑합니다.
 */
export const mapHouseAuditToUiModel = (dto: HouseAuditResponseDto): AuditSummaryItem[] => {
  const { data } = dto;
  if (!data) return []; // (Safety) 데이터가 비어있을 경우 빈 배열 반환
  const items: AuditSummaryItem[] = [];

  const isSuccess = data.supportedHouseType && data.nearestBranch?.currentBranchIsNearest;

  // 1. 주택 심사 통합 (시세, 거리, 위반 등)
  items.push({
    id: 'house-audit',
    title: '주택 담보물 심사',
    summary: data.supportedHouseType 
      ? `${data.housePrice.price.toLocaleString()}만원 (${data.housePrice.priceType})`
      : '시세 정보 없음',
    status: isSuccess ? 'SUCCESS' : 'ERROR',
    message: isSuccess ? undefined : '심사 불가능: 해당 물건지는 당행에서 취급하지 않거나 관할 지점 범위를 벗어납니다.',
    details: data,
  });

  return items;
};
