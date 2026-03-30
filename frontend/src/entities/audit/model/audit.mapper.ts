import { AuditSummaryItem, HouseAuditResponseDto, MyDataResDto } from './types';

export const mapHouseAuditToUiModel = (data: HouseAuditResponseDto['data']): AuditSummaryItem[] => {
  if (!data) return [];
  const items: AuditSummaryItem[] = [];

  const isSuccess = data.supportedHouseType && data.nearestBranch?.currentBranchIsNearest;

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

export const mapMyDataToUiModel = (dto: Partial<MyDataResDto>): AuditSummaryItem[] => {
  const items: AuditSummaryItem[] = [];

  items.push({
    id: 'credit-rating',
    title: '신용등급 조회',
    summary: dto.ratingName ? `${dto.ratingName} 등급` : '조회 중...',
    status: 'SUCCESS',
    details: { ratingName: dto.ratingName, userId: dto.userId },
  });

  items.push({
    id: 'loan-history',
    title: '기존 대출 내역',
    summary: dto.loanProducts
      ? `${dto.loanProducts.length}건 / 잔액 ${dto.totalLoanBalance?.toLocaleString() || 0}원`
      : '조회 중...',
    status: 'SUCCESS',
    details: dto,
  });

  return items;
};