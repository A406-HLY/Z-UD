import { ProcessedProduct, ProcessedReviewItem, LoanProduct } from '../model/types';
import { APPROVAL_STATUS } from '@/shared/config/constants';

/**
 * API에서 전달된 단일 상품 데이터(LoanProduct)를 UI 컴포넌트에서 
 * 그리기 쉬운 형태(ProcessedProduct)로 언패킹 및 변환하는 순수 함수입니다.
 */
export const mapLoanProductToViewModel = (
  productKey: string, 
  productData: LoanProduct
): ProcessedProduct => {
  // 1. 심사 보조 결과(aiResults) 추출 및 평탄화
  const items: ProcessedReviewItem[] = Object.entries(productData.aiResults || {}).map(([key, item]) => ({
    ...item,
    key
  }));

  // 2. 단일 거절 항목 존재 시 상품 전체 미승인 처리
  const isApproved = !items.some(item => item.result === APPROVAL_STATUS.REJECT);

  // 3. 상품 속 심사 항목 정렬 (결과가 나쁜 거절 항목을 최상단으로)
  const sortedItems = [...items].sort((a, b) => {
    if (a.result === APPROVAL_STATUS.REJECT && b.result !== APPROVAL_STATUS.REJECT) return -1;
    if (a.result !== APPROVAL_STATUS.REJECT && b.result === APPROVAL_STATUS.REJECT) return 1;
    return 0; // 원본 유지
  });

  // 4. API 한도 데이터 언패킹 (기존 프론트엔드 수동 계산 로직 대체)
  const ltvLimitNum = productData.ltvBasedLoanLimit
      ? parseInt(productData.ltvBasedLoanLimit.LTVRatio.replace('%', '')) || 0
      : 0;
  const dsrLimitNum = productData.dsrBasedLoanLimit
      ? parseInt(productData.dsrBasedLoanLimit.DSRRatio.replace('%', '')) || 0
      : 0;
  
  const calculatedLimit = productData.ltvBasedLoanLimit?.value 
      ? productData.ltvBasedLoanLimit.value * 100000000 // 단위: 억을 원으로 변환
      : 0;

  // 5. 시각화 UI 컴포넌트(LimitVisualizationCard)를 위한 파라미터 셋 구성
  const limitParams = [];
  if (productData.ltvBasedLoanLimit) {
      limitParams.push({ 
        label: "평가 시세 (Market Price)", 
        value: `${productData.ltvBasedLoanLimit.collateralMarketPrice.toLocaleString()} 원` 
      });
      limitParams.push({ 
        label: "적용 LTV (Loan To Value)", 
        value: productData.ltvBasedLoanLimit.LTVRatio 
      });
  }
  if (productData.dsrBasedLoanLimit) {
      limitParams.push({ 
        label: "연간 소득 (Annual Income)", 
        value: `${productData.dsrBasedLoanLimit.annualIncomeTotal.toLocaleString()} 원` 
      });
      limitParams.push({ 
        label: "적용 DSR (Debt Service Ratio)", 
        value: productData.dsrBasedLoanLimit.DSRRatio 
      });
  }

  return {
    productKey,
    productName: productData.productName || productKey, // UI 한국어 노출용
    isApproved,
    ltvLimit: ltvLimitNum,
    dsrLimit: dsrLimitNum,
    calculatedLimit,
    limitParams,
    items: sortedItems
  };
};
