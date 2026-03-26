/**
 * @entity Audit
 * 심사 결과와 관련된 데이터 타입을 정의합니다.
 */

/** 백엔드 API 응답 DTO: 주택 심사 결과 */
export interface HouseAuditResponseDto {
  success: boolean;
  data: {
    illegalBuilding: boolean; // 위반건축물 여부
    nearestBranch: {
      currentBranchIsNearest: boolean; // 현재 지점이 가장 가까운지 여부
      currentBranchName: string;
      currentBranchAddress: string;
      currentBranchDistanceMeter: number;
      nearestBranchName: string;
      nearestBranchAddress: string;
      nearestBranchDistanceMeter: number;
      message: string; // 안내 메시지
    };
    supportedHouseType: boolean; // 주택 시세 조회 지원 여부
    housePrice: {
      price: number; // 주택 가격 (만원 단위)
      priceType: string; // 가격 타입 (실거래가, 공시가, 근삿값)
      message: string;
    };
  };
}

/** 백엔드 API 요청 DTO */
export interface HouseAuditRequestDto {
  illegalBuilding: boolean;
  houseType: string;
  propertyAddress: string;
}

/** 
 * 마이데이터 조회 요청 DTO 
 * (Why) 고객명을 기준으로 내부 DB 조회 및 외부 API 연동을 수행합니다.
 */
export interface MyDataReqDto {
  customerName: string;
}

/** 마이데이터 대출상품 개별 항목 */
export interface MyDataLoanProduct {
  accountNo: string;
  accountName: string;
  loanBalance: number;
  remainingLoanBalance: number;
  annualPrincipalAndInterestRepayment: number;
}

/** 
 * 마이데이터 조회 응답 DTO 
 * (Why) 신용등급과 대출 잔액, 연간 상환액 등 통합된 금융 정보를 포함합니다.
 */
export interface MyDataResDto {
  userId: string;
  ratingName: string;
  totalLoanBalance: number;
  totalRemainingLoanBalance: number;
  totalAnnualPrincipalAndInterestRepayment: number;
  loanProducts: MyDataLoanProduct[];
}

/** 
 * UI용 통합 심사 아이템 모델 
 * (Why) 다양한 심사 API(주택, 신용 등) 결과물을 일관된 UI로 보여주기 위해 추상화된 모델을 사용합니다.
 */
export type AuditStatus = 'SUCCESS' | 'WARNING' | 'ERROR' | 'LOADING';

export interface AuditSummaryItem {
  id: string; // 각 심사 항목 식별자
  title: string; // 항목명
  summary: string; // 요약된 결과 텍스트
  status: AuditStatus; // 상태
  message?: string; // 상세 안내 메시지
  actionLabel?: string; // 우측 버튼 라벨 (있을 경우)
  details?: unknown; // (Why) 우측 디테일 패널에서 보여줄 가공된 상세 데이터
}
