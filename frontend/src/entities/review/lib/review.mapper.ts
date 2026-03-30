import { ProcessedProduct, ProcessedReviewItem, LoanProduct, LimitParam } from '../model/types';
import { CALCULATE_LABELS } from '../config/constants';

export const mapLoanProductToViewModel = (
  productCode: string,
  productData: LoanProduct
): ProcessedProduct => {
  const items: ProcessedReviewItem[] = (productData.forReport?.fieldResults || []).map((item) => ({
    ...item,
    key: item.fieldKey || 'unknown',
    value: item.inputValue,
    matched_articles: item.usedArticles || [],
    isRequired: item.isRequired ?? false,
    excludedFromFinal: item.excludedFromFinal ?? false
  }));

  const finalResult = productData.forReport?.summary?.finalResult || '검토';
  const isApproved = finalResult !== '반려';

  const limitParams: LimitParam[] = [];
  const calc = productData.forCalculate;

  if (calc) {
    if (calc.collateralMarketPrice?.value !== null) {
      limitParams.push({
        label: CALCULATE_LABELS.MARKET_PRICE,
        value: `${Number(calc.collateralMarketPrice.value).toLocaleString()} 원`,
        reason: calc.collateralMarketPrice.reason,
        usedArticles: calc.collateralMarketPrice.usedArticles
      });
    }

    if (calc.maximumClaimAmount?.value !== null) {
      limitParams.push({
        label: CALCULATE_LABELS.MAX_CLAIM_AMOUNT,
        value: `${Number(calc.maximumClaimAmount.value).toLocaleString()} 원`,
        reason: calc.maximumClaimAmount.reason,
        usedArticles: calc.maximumClaimAmount.usedArticles
      });
    }

    if (calc.totalRemainingLoanBalance?.value !== null) {
      limitParams.push({
        label: CALCULATE_LABELS.REMAINING_BALANCE,
        value: `${Number(calc.totalRemainingLoanBalance.value).toLocaleString()} 원`,
        reason: calc.totalRemainingLoanBalance.reason,
        usedArticles: calc.totalRemainingLoanBalance.usedArticles
      });
    }

    if (calc.LTVRatio) {
      const isLtvCalculable = calc.LTVRatio.value !== null;
      const ltvValueText = isLtvCalculable
        ? `${(Number(calc.LTVRatio.value) * 100).toFixed(0)}%`
        : '산정불가';

      const houseCountSuffix = calc.LTVRatio.ownedHouseCountApplied !== null
        ? ` (${calc.LTVRatio.ownedHouseCountApplied}주택 기준)`
        : '';
      limitParams.push({
        label: `${CALCULATE_LABELS.APPLIED_LTV}${houseCountSuffix}`,
        value: ltvValueText,
        reason: calc.LTVRatio.reason,
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
        reason: calc.annualIncomeTotal.reason,
        usedArticles: calc.annualIncomeTotal.usedArticles
      });
    }

    if (calc.annualPrincipalAndInterestRepayment?.value !== null) {
      limitParams.push({
        label: CALCULATE_LABELS.ANNUAL_REPAYMENT,
        value: `${Number(calc.annualPrincipalAndInterestRepayment.value).toLocaleString()} 원`,
        reason: calc.annualPrincipalAndInterestRepayment.reason,
        usedArticles: calc.annualPrincipalAndInterestRepayment.usedArticles
      });
    }

    if (calc.DSRRatio) {
      const isDsrCalculable = calc.DSRRatio.value !== null;
      limitParams.push({
        label: CALCULATE_LABELS.APPLIED_DSR,
        value: isDsrCalculable ? `${(Number(calc.DSRRatio.value) * 100).toFixed(0)}%` : '산정불가',
        reason: calc.DSRRatio.reason,
        usedArticles: calc.DSRRatio.usedArticles
      });
    }
  }

  const ltvVal = calc?.LTVRatio?.value !== null ? Number(calc?.LTVRatio?.value) * 100 : null;
  const dsrVal = calc?.DSRRatio?.value !== null ? Number(calc?.DSRRatio?.value) * 100 : null;

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