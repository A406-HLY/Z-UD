import { ProcessedProduct, ProcessedReviewItem, LoanProduct, LimitParam } from '../model/types';
import { CALCULATE_LABELS } from '../config/constants';

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
    name_ko: item.koreanField || '항목명 없음', // V2: koreanField 사용
    result: (item.judgement as any) || '검토', // V2: judgement 사용
    reason: item.explanation?.summary || '', // V2: explanation.summary 사용
    key: item.fieldKey || 'unknown',
    value: item.inputValue, 
    matched_articles: item.usedArticles || [],
    isRequired: item.isRequired ?? false,
    excludedFromFinal: item.excludedFromFinal ?? false
  }));

  // 2. 승인 여부 판정 (백엔드 요약 결과 기반)
  const finalResult = productData.forReport?.summary?.finalResult || '검토';
  const isApproved = finalResult !== '반려';

  // 3. 한도 시각화 UI 컴포넌트(LimitVisualizationCard)를 위한 파라미터 셋 구성
  const limitParams: LimitParam[] = [];
  const calc = productData.forCalculate;

  if (calc) {
    if (calc.collateralMarketPrice?.value !== null) {
      limitParams.push({ 
        label: CALCULATE_LABELS.MARKET_PRICE, 
        value: `${Number(calc.collateralMarketPrice.value).toLocaleString()} 원`,
        reason: calc.collateralMarketPrice.explanation?.summary || calc.collateralMarketPrice.reason,
        usedArticles: calc.collateralMarketPrice.usedArticles
      });
    }

    // (New) 채권최고액 합계 추가
    if (calc.maximumClaimAmount?.value !== null) {
      limitParams.push({
        label: CALCULATE_LABELS.MAX_CLAIM_AMOUNT,
        value: `${Number(calc.maximumClaimAmount.value).toLocaleString()} 원`,
        reason: calc.maximumClaimAmount.explanation?.summary || calc.maximumClaimAmount.reason,
        usedArticles: calc.maximumClaimAmount.usedArticles
      });
    }

    if (calc.totalRemainingLoanBalance?.value !== null) {
      limitParams.push({ 
        label: CALCULATE_LABELS.REMAINING_BALANCE, 
        value: `${Number(calc.totalRemainingLoanBalance.value).toLocaleString()} 원`,
        reason: calc.totalRemainingLoanBalance.explanation?.summary || calc.totalRemainingLoanBalance.reason,
        usedArticles: calc.totalRemainingLoanBalance.usedArticles
      });
    }
    
    if (calc.LTVRatio) {
      const isLtvCalculable = calc.LTVRatio.value !== null;
      const ltvValueText = isLtvCalculable 
        ? `${(Number(calc.LTVRatio.value) * 100).toFixed(0)}%`
        : '산정불가';

      // (Why) 보유 주택 수에 따라 규제가 달라지므로 레이블에 포함하여 명시성을 높임
      const houseCountSuffix = calc.LTVRatio.ownedHouseCountApplied !== null 
        ? ` (${calc.LTVRatio.ownedHouseCountApplied}주택 기준)` 
        : '';
      limitParams.push({ 
        label: `${CALCULATE_LABELS.APPLIED_LTV}${houseCountSuffix}`, 
        value: ltvValueText,
        reason: calc.LTVRatio.explanation?.summary || calc.LTVRatio.reason,
        usedArticles: calc.LTVRatio.usedArticles
      });
    }

    if (calc.LTVRatio?.regulationRegion) {
      limitParams.push({ 
        label: CALCULATE_LABELS.REGULATION_REGION, 
        value: calc.LTVRatio.regulationRegion 
      });
    }

    if (calc.annualIncomeTotal?.value !== null) {
      limitParams.push({ 
        label: CALCULATE_LABELS.ANNUAL_INCOME, 
        value: `${Number(calc.annualIncomeTotal.value).toLocaleString()} 원`,
        reason: calc.annualIncomeTotal.explanation?.summary || calc.annualIncomeTotal.reason,
        usedArticles: calc.annualIncomeTotal.usedArticles
      });
    }

    // (New) 연간 원리금 상환액 추가
    if (calc.annualPrincipalAndInterestRepayment?.value !== null) {
      limitParams.push({
        label: CALCULATE_LABELS.ANNUAL_REPAYMENT,
        value: `${Number(calc.annualPrincipalAndInterestRepayment.value).toLocaleString()} 원`,
        reason: calc.annualPrincipalAndInterestRepayment.explanation?.summary || calc.annualPrincipalAndInterestRepayment.reason,
        usedArticles: calc.annualPrincipalAndInterestRepayment.usedArticles
      });
    }

    if (calc.DSRRatio) {
      const isDsrCalculable = calc.DSRRatio.value !== null;
      limitParams.push({ 
        label: CALCULATE_LABELS.APPLIED_DSR, 
        value: isDsrCalculable ? `${(Number(calc.DSRRatio.value) * 100).toFixed(0)}%` : '산정불가',
        reason: calc.DSRRatio.explanation?.summary || calc.DSRRatio.reason,
        usedArticles: calc.DSRRatio.usedArticles
      });
    }
  }

  // 4. 숫자형 한도 값 추출 (UI 게이지용)
  const ltvVal = calc?.LTVRatio?.value !== null ? Number(calc?.LTVRatio?.value) * 100 : null;
  const dsrVal = calc?.DSRRatio?.value !== null ? Number(calc?.DSRRatio?.value) * 100 : null;

  // 5. 최종 산출 한도 계산 (백엔드 실제 산출액 우선, 없을 시 가계산)
  const marketPrice = Number(calc?.collateralMarketPrice?.value || 0);
  const ltvRatio = Number(calc?.LTVRatio?.value || 0);
  const backendCalculated = productData.forReport?.summary?.calculatedAmount;
  const calculatedLimit = typeof backendCalculated === 'number' ? backendCalculated : (marketPrice * ltvRatio);

  return {
    productKey: productCode,
    productName: productData.productName,
    isApproved,
    finalResult,
    finalReason: productData.forReport?.summary?.reason || '',
    ltvLimit: ltvVal,
    dsrLimit: dsrVal,
    calculatedLimit: calculatedLimit,
    ltvArticles: calc?.LTVRatio?.usedArticles || [],
    dsrArticles: calc?.DSRRatio?.usedArticles || [],
    limitParams,
    items: items,
    summary: {
      keyApprovalReasons: productData.forReport?.summary?.keyApprovalReasons || [],
      keyRejectReasons: productData.forReport?.summary?.keyRejectReasons || [],
      keyReviewReasons: productData.forReport?.summary?.keyReviewReasons || [],
    }
  };
};
