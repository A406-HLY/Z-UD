import { ProcessedProduct, ProcessedReviewItem, LoanProduct } from '../model/types';

/**
 * API에서 전달된 단일 상품 데이터(LoanProduct)를 UI 컴포넌트에서 
 * 그리기 쉬운 형태(ProcessedProduct)로 언패킹 및 변환하는 순수 함수입니다 (V2).
 */
export const mapLoanProductToViewModel = (
  productCode: string, 
  productData: LoanProduct
): ProcessedProduct => {
  // 1. 심사 상세 결과(fieldResults) 평탄화 및 UI 호환성 매핑
  const items: ProcessedReviewItem[] = (productData.forReport?.fieldResults || []).map((item) => ({
    ...item,
    key: item.fieldKey || 'unknown',
    value: item.inputValue, // UI에서 value 필드명을 사용하므로 별칭 매핑
    matched_articles: item.usedArticles || [] // UI에서 matched_articles 필드명을 사용하므로 별칭 매핑
  }));

  // 2. 승인 여부 판정 (백엔드 요약 결과 기반)
  const finalResult = productData.forReport?.summary?.finalResult || '검토';
  const isApproved = finalResult !== '반려';

  // 3. 한도 시각화 UI 컴포넌트(LimitVisualizationCard)를 위한 파라미터 셋 구성
  const limitParams = [];
  const calc = productData.forCalculate;

  if (calc) {
    if (calc.collateralMarketPrice?.value !== null) {
      limitParams.push({ 
        label: "평가 시세", 
        value: `${Number(calc.collateralMarketPrice.value).toLocaleString()} 원` 
      });
    }
    if (calc.totalRemainingLoanBalance?.value !== null) {
      limitParams.push({ 
        label: "기존 대출 잔액", 
        value: `${Number(calc.totalRemainingLoanBalance.value).toLocaleString()} 원` 
      });
    }
    if (calc.LTVRatio?.value !== null) {
      limitParams.push({ 
        label: "적용 LTV", 
        value: `${(Number(calc.LTVRatio.value) * 100).toFixed(0)}%` 
      });
    }
    if (calc.LTVRatio?.regulationRegion) {
      limitParams.push({ 
        label: "규제 지역", 
        value: calc.LTVRatio.regulationRegion 
      });
    }
    if (calc.annualIncomeTotal?.value !== null) {
      limitParams.push({ 
        label: "연간 소득 합계", 
        value: `${Number(calc.annualIncomeTotal.value).toLocaleString()} 원` 
      });
    }
    if (calc.DSRRatio?.value !== null) {
      limitParams.push({ 
        label: "적용 DSR", 
        value: `${(Number(calc.DSRRatio.value) * 100).toFixed(0)}%` 
      });
    }
  }

  // 4. 숫자형 한도 값 추출 (UI 게이지용)
  const ltvVal = calc?.LTVRatio?.value !== null ? Number(calc?.LTVRatio?.value) * 100 : 0;
  const dsrVal = calc?.DSRRatio?.value !== null ? Number(calc?.DSRRatio?.value) * 100 : 0;

  // 5. 최종 산출 한도 계산 (임시 로직: 시세 * LTV 기준, 실제 백엔드에 최종값이 있다면 그것을 사용)
  // (Why) 백엔드 응답에 최종 대출 가능 한도 금액이 명시되지 않은 경우 가계산을 수행합니다.
  const marketPrice = Number(calc?.collateralMarketPrice?.value || 0);
  const ltvRatio = Number(calc?.LTVRatio?.value || 0);
  const calculatedLimit = marketPrice * ltvRatio;

  return {
    productKey: productCode,
    productName: productData.productName,
    isApproved,
    finalResult,
    finalReason: productData.forReport?.summary?.reason || '',
    ltvLimit: ltvVal,
    dsrLimit: dsrVal,
    calculatedLimit: calculatedLimit,
    limitParams,
    items: items,
    summary: {
      keyApprovalReasons: productData.forReport?.summary?.keyApprovalReasons || [],
      keyRejectReasons: productData.forReport?.summary?.keyRejectReasons || [],
      keyReviewReasons: productData.forReport?.summary?.keyReviewReasons || [],
    }
  };
};
