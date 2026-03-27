import { ConsultationResponse } from '../model/types';

// 2. 타입이 적용된 더미 데이터 객체
export const dummyConsultationData: ConsultationResponse = {
  consultationId: "CONS-2026-EMP-001",
  result: {
    ssadimdol: {
      productName: "싸딤돌",
      interestRate: "15%",
      repaymentPeriod: "30년",
      stressDSR: {
        name_ko: "스트레스 DSR",
        value: "3%",
        search_query: "대출 심사 시 기존 부채 및 신규 대출의 원리금 상환 부담 산정에 적용되는 스트레스 DSR 가산 금리 기준 및 적용 비율은 어떻게 되는가?",
        matched_articles: [
          "제14조",
          "제12조"
        ]
      },
      ltvBasedLoanLimit: {
        collateralMarketPrice: 900000000,
        LTVRatio: "35%",
        maximumClaimAmount: 100000000,
        totalRemainingLoanBalance: 150000000,
        value: 6
      },
      dsrBasedLoanLimit: {
        DSRRatio: "40%",
        annualIncomeTotal: 70000000,
        annualPrincipalAndInterestRepayment: 14400000,
        interestRate: "10%",
        stressRateAdjustment: "0.6%",
        stressDSR: "3%",
        repaymentPeriodYears: 30,
        value: 8
      },
      aiResults: {
        creditRating: {
        name_ko: "신용등급",
        value: "A",
        matched_articles: [
          "제2조"
        ],
        result: "승인",
        reason: "제2조에 따라 신용등급이 A등급으로 대출 심사가 가능합니다."
      },
      loanPurpose: {
        name_ko: "대출 목적",
        value: "주택 구매",
        matched_articles: [
          "제3조",
          "제1조",
          "제6조"
        ],
        result: "승인",
        reason: "제3조, 제1조, 제6조에 따른 대출 목적 판단 결과, 제출된 '주택 구매'는 정당한 대출 목적으로 인정됩니다."
      },
      ownedHouseCount: {
        name_ko: "보유주택수",
        value: 0,
        matched_articles: [
          "제4조",
          "제10조"
        ],
        result: "승인",
        reason: "제4조, 제10조에 따라 보유주택 수가 0채로 무주택자에 해당하여 심사 진행 및 우대 적용이 가능합니다."
      },
      ownerName: {
        name_ko: "소유자 성명",
        value: "이철수",
        matched_articles: [
          "제5조"
        ],
        result: "승인",
        reason: "제5조에 따라 제출된 소유자 성명(이철수)과 매도인이 일치함을 확인할 수 있습니다."
      },
      buyer: {
        name_ko: "매수인 성명",
        value: {
          name: "홍길동"
        },
        matched_articles: [
          "제5조"
        ],
        result: "승인",
        reason: "제5조에 따라 제출된 매수인 성명(홍길동)과 차주가 일치하여 정당한 매수인으로 확인됩니다."
      },
      buildingType: {
        name_ko: "건물 종류",
        value: "아파트",
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 건축물대장상 용도가 '아파트'로 명시되어 주거용 부동산으로서 적격성이 인정됩니다."
      },
      mainUsage: {
        name_ko: "주용도",
        value: "공동주택",
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 주용도가 '공동주택'으로 주거용 요건을 만족합니다."
      },
      isViolationBuilding: {
        name_ko: "위반건축물 확인",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 위반건축물이 아님이 확인되어(false) 담보 취급 제한에 해당하지 않습니다."
      },
      hasTrustRegistration: {
        name_ko: "신탁등기 여부",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 신탁등기가 존재하지 않아(false) 소유권 귀속에 문제가 없습니다."
      },
      hasLandRightCause: {
        name_ko: "토지 별도등기 여부",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 토지 별도등기가 없어 담보 취급에 문제가 없습니다."
      },
      collateralMarketPrice: {
        name_ko: "담보 시세",
        value: 900000000,
        matched_articles: [
          "제10조",
          "제13조",
          "제7조",
          "제1조"
        ],
        result: "승인",
        reason: "제10조, 제13조, 제7조, 제1조에 따라 담보 시세 가치(900,000,000원)가 정상적으로 수집되어 대출 가능 금액 산정이 가능합니다."
      },
      salePrice: {
        name_ko: "최근 실거래가",
        value: 1000000000,
        matched_articles: [
          "제1조",
          "제7조",
          "제13조",
          "제10조"
        ],
        result: "승인",
        reason: "제1조, 제7조, 제13조, 제10조에 따라 담보가치 산정 기준 중 하나인 최근 실거래가(1,000,000,000원)가 정상 산정됩니다."
      },
      totalRemainingLoanBalance: {
        name_ko: "총 대출 잔액",
        value: null,
        matched_articles: [],
        result: "자료 보완 요망",
        reason: "총 대출 잔액 값이 누락되어 대출 심사 및 평가를 진행할 수 없습니다."
      },
      annualPrincipalAndInterestRepayment: {
        name_ko: "연간 원리금 상환액",
        value: 14400000,
        matched_articles: [
          "제12조",
          "제13조",
          "제2조",
          "제11조"
        ],
        result: "승인",
        reason: "제12조, 제13조, 제2조, 제11조에 따른 DSR 산정에 기존 대출 연간 원리금상환액(14,400,000원)을 기준 정보로 활용할 수 있습니다."
      },
      employmentType: {
        name_ko: "근무 유형",
        value: "근로자",
        matched_articles: [
          "제11조"
        ],
        result: "승인",
        reason: "제11조에 따라 근무 유형(근로자)이 확인되어 상환 능력 산정 요건을 파악할 수 있습니다."
      },
      workPeriod: {
        name_ko: "근무기간",
        value: "2025.01.01-2025.12.31",
        matched_articles: [
          "제11조"
        ],
        result: "승인",
        reason: "제11조 소득 및 재직 확인 기준에 따라 정상적인 근무 기간 여부가 확인됩니다."
      },
      annualIncomeTotal: {
        name_ko: "연간 소득 합계",
        value: 70000000,
        matched_articles: [
          "제12조",
          "제11조",
          "제13조",
          "제1조",
          "제2조"
        ],
        result: "승인",
        reason: "제12조, 제11조, 제13조, 제1조, 제2조에 따라 연간 소득 합계(70,000,000원) 증빙이 확인결원리차주의 상환능력 DSR 한도 평가 심사가 진행 가능합니다."
      },
      seniorRights: {
        name_ko: "채권최고액",
        value: [
          {
            maximumClaimAmount: 100000000
          }
        ],
        matched_articles: [
          "제10조",
          "제13조",
          "제8조"
        ],
        result: "승인",
        reason: "제10조, 제13조, 제8조 LTV 산정식에 따라 LTV 한도 차감 요건인 선순위 채권최고액(100,000,000원)이 정상 반영되었습니다."
      },
      deathConfirmed: {
        name_ko: "사망자 확인",
        value: "0명",
        matched_articles: [
          "제9조"
        ],
        result: "거절",
        reason: "제9조에 따라 세대원 중 사망자가 1명 이상 존재해야 하나 해당하는 자가 없어(0명) 취급 불가 대상입니다."
      },
      hasOwnershipTransferClaim: {
        name_ko: "권리침해 여부",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 권리침해(소유권이전청구권가등기 등)가 존재하지 않아(false) 담보 취급에 문제가 없습니다."
      },
      propertyAddress: {
        name_ko: "소재지 주소",
        value: "서울특별시 강남구 테헤란로 123, 101동 502호",
        matched_articles: [
          "제8조",
          "제10조",
          "제7조"
        ],
        result: "승인",
        reason: "제8조, 제10조, 제7조에 따라 소재지 주소 확인 결과 금융 규제 지역의 엄격한 LTV 비율을 적용하도록 반영되었습니다."
      },
      floorStatusList: {
        name_ko: "층별 현황 목록",
        value: [
          {
            floor: "5층",
            usage: "아파트",
            area: 84.5
          }
        ],
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 건축물 층별 현황상 용도가 정상적으로 주거용으로 확인됩니다."
      },
      subscriberType: {
        name_ko: "가입자 구분",
        value: "직장가입자",
        matched_articles: [
          "제11조"
        ],
        result: "승인",
        reason: "제11조 소득 및 재직 확인 기준에 따라 해당 신청자가 가입자로 식별되어 요건을 충족합니다."
      },
      LTVRatio: {
        name_ko: "LTV 비율",
        value: "LTV 비율",
        matched_articles: [
          "제10조",
          "제13조"
        ],
        result: "검토 요망",
        reason: "제10조, 제13조 규정에 따른 LTV 비율 산출 시 수치 대신 'LTV 비율' 문자가 전달되어 정확한 평가가 필요합니다."
      },
      DSRRatio: {
        name_ko: "DSR 비율",
        value: "DSR 비율",
        matched_articles: [
          "제12조",
          "제13조"
        ],
        result: "검토 요망",
        reason: "제12조, 제13조 규정에 따른 DSR 비율 산출 시 수치 대신 'DSR 비율' 문자가 전달되어 정확한 평가가 필요합니다."
      }
    }
  },
  ssageumjari: {
      productName: "싸금자리",
      interestRate: "4.5%",
      repaymentPeriod: "40년",
      ltvBasedLoanLimit: {
        collateralMarketPrice: 900000000,
        LTVRatio: "35%",
        maximumClaimAmount: 100000000,
        totalRemainingLoanBalance: 150000000,
        value: 6
      },
      dsrBasedLoanLimit: {
        DSRRatio: "40%",
        annualIncomeTotal: 70000000,
        annualPrincipalAndInterestRepayment: 14400000,
        interestRate: "10%",
        stressRateAdjustment: "0.6%",
        stressDSR: "3%",
        repaymentPeriodYears: 30,
        value: 8
      },
      stressDSR: {
        name_ko: "스트레스 DSR",
        value: "3%",
        search_query: "대출 심사 시 기존 부채 및 신규 대출의 원리금 상환 부담 산정에 적용되는 스트레스 DSR(총부채원리금상환비율) 가산 금리 기준 및 적용 비율은 어떻게 되는가?",
        matched_articles: [
          "제13조"
        ]
      },
      aiResults: {
        creditRating: {
        name_ko: "신용등급",
        value: "A",
        matched_articles: [
          "제2조"
        ],
        result: "승인",
        reason: "제2조에 따라 신용등급이 A등급으로 대출 심사가 가능합니다."
      },
      loanPurpose: {
        name_ko: "대출 목적",
        value: "주택 구매",
        matched_articles: [
          "제3조",
          "제1조",
          "제6조"
        ],
        result: "승인",
        reason: "제3조, 제1조, 제6조에 따른 대출 목적 판단 결과, 제출된 '주택 구매'는 정당한 대출 목적으로 인정됩니다."
      },
      ownedHouseCount: {
        name_ko: "보유주택수",
        value: 0,
        matched_articles: [
          "제4조",
          "제9조"
        ],
        result: "승인",
        reason: "제4조, 제9조에 따라 보유주택 수가 0채로 무주택자에 해당하여 심사 진행 및 우대 적용이 가능합니다."
      },
      ownerName: {
        name_ko: "소유자 성명",
        value: "이철수",
        matched_articles: [
          "제5조"
        ],
        result: "승인",
        reason: "제5조에 따라 제출된 소유자 성명(이철수)과 매도인이 일치함을 확인할 수 있습니다."
      },
      buyer: {
        name_ko: "매수인 성명",
        value: {
          name: "홍길동"
        },
        matched_articles: [
          "제5조"
        ],
        result: "승인",
        reason: "제5조에 따라 제출된 매수인 성명(홍길동)과 차주가 일치하여 정당한 매수인으로 확인됩니다."
      },
      buildingType: {
        name_ko: "건물 종류",
        value: "아파트",
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 건축물대장상 용도가 '아파트'로 명시되어 주거용 부동산으로서 적격성이 인정됩니다."
      },
      mainUsage: {
        name_ko: "주용도",
        value: "공동주택",
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 주용도가 '공동주택'으로 주거용 요건을 만족합니다."
      },
      isViolationBuilding: {
        name_ko: "위반건축물 확인",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 위반건축물이 아님이 확인되어(false) 담보 취급 제한에 해당하지 않습니다."
      },
      hasTrustRegistration: {
        name_ko: "신탁등기 여부",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 신탁등기가 존재하지 않아(false) 소유권 귀속에 문제가 없습니다."
      },
      hasLandRightCause: {
        name_ko: "토지 별도등기 여부",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 토지 별도등기가 없어 담보 취급에 문제가 없습니다."
      },
      collateralMarketPrice: {
        name_ko: "담보 시세",
        value: 900000000,
        matched_articles: [
          "제9조",
          "제12조",
          "제7조",
          "제1조"
        ],
        result: "승인",
        reason: "제9조, 제12조, 제7조, 제1조에 따라 담보 시세 가치(900,000,000원)가 정상적으로 수집되어 대출 가능 금액 산정이 가능합니다."
      },
      salePrice: {
        name_ko: "최근 실거래가",
        value: 1000000000,
        matched_articles: [
          "제1조",
          "제7조",
          "제12조",
          "제9조"
        ],
        result: "승인",
        reason: "제1조, 제7조, 제12조, 제9조에 따라 담보가치 산정 기준 중 하나인 최근 실거래가(1,000,000,000원)가 정상 산정됩니다."
      },
      totalRemainingLoanBalance: {
        name_ko: "총 대출 잔액",
        value: null,
        matched_articles: [],
        result: "자료 보완 요망",
        reason: "총 대출 잔액 값이 누락되어 대출 심사 및 평가를 진행할 수 없습니다."
      },
      annualPrincipalAndInterestRepayment: {
        name_ko: "연간 원리금 상환액",
        value: 14400000,
        matched_articles: [
          "제11조",
          "제12조",
          "제2조",
          "제10조"
        ],
        result: "승인",
        reason: "제11조, 제12조, 제2조, 제10조에 따른 DSR 산정에 기존 대출 연간 원리금상환액(14,400,000원)을 기준 정보로 활용할 수 있습니다."
      },
      employmentType: {
        name_ko: "근무 유형",
        value: "근로자",
        matched_articles: [
          "제10조"
        ],
        result: "승인",
        reason: "제10조에 따라 근무 유형(근로자)이 확인되어 상환 능력 산정 요건을 파악할 수 있습니다."
      },
      workPeriod: {
        name_ko: "근무기간",
        value: "2025.01.01-2025.12.31",
        matched_articles: [
          "제10조"
        ],
        result: "승인",
        reason: "제10조 소득 및 재직 확인 기준에 따라 정상적인 근무 기간 여부가 확인됩니다."
      },
      annualIncomeTotal: {
        name_ko: "연간 소득 합계",
        value: 70000000,
        matched_articles: [
          "제11조",
          "제10조",
          "제12조",
          "제1조",
          "제2조"
        ],
        result: "승인",
        reason: "제11조, 제10조, 제12조, 제1조, 제2조에 따라 연간 소득 합계(70,000,000원) 증빙이 확인결원리차주의 상환능력 DSR 한도 평가 심사가 진행 가능합니다."
      },
      seniorRights: {
        name_ko: "채권최고액",
        value: [
          {
            maximumClaimAmount: 100000000
          }
        ],
        matched_articles: [
          "제9조",
          "제12조",
          "제8조"
        ],
        result: "승인",
        reason: "제9조, 제12조, 제8조 LTV 산정식에 따라 LTV 한도 차감 요건인 선순위 채권최고액(100,000,000원)이 정상 반영되었습니다."
      },
      deathConfirmed: {
        name_ko: "사망자 확인",
        value: "0명",
        matched_articles: [],
        result: "상관 없음",
        reason: "해당 조항들은 사망 확인과 무관합니다. 본 상품(싸금자리)은 취급 시 사망자 확인 내규 규정을 갖추고 있지 않으므로 확인 여부가 허위나 심사에 영향을 미치지 않습니다. (매핑 오탐 감지)"
      },
      hasOwnershipTransferClaim: {
        name_ko: "권리침해 여부",
        value: false,
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 권리침해(소유권이전청구권가등기 등)가 존재하지 않아(false) 담보 취급에 문제가 없습니다."
      },
      propertyAddress: {
        name_ko: "소재지 주소",
        value: "서울특별시 강남구 테헤란로 123, 101동 502호",
        matched_articles: [
          "제8조",
          "제9조",
          "제7조"
        ],
        result: "승인",
        reason: "제8조, 제9조, 제7조에 따라 소재지 주소 확인 결과 금융 규제 지역의 엄격한 LTV 비율을 적용하도록 반영되었습니다."
      },
      floorStatusList: {
        name_ko: "층별 현황 목록",
        value: [
          {
            floor: "5층",
            usage: "아파트",
            area: 84.5
          }
        ],
        matched_articles: [
          "제7조"
        ],
        result: "승인",
        reason: "제7조에 따라 건축물 층별 현황상 용도가 정상적으로 주거용으로 확인됩니다."
      },
      subscriberType: {
        name_ko: "가입자 구분",
        value: "직장가입자",
        matched_articles: [
          "제10조"
        ],
        result: "승인",
        reason: "제10조 소득 및 재직 확인 기준에 따라 해당 신청자가 가입자로 식별되어 요건을 충족합니다."
      },
      LTVRatio: {
        name_ko: "LTV 비율",
        value: "LTV 비율",
        matched_articles: [
          "제9조",
          "제12조"
        ],
        result: "검토 요망",
        reason: "제9조, 제12조 규정에 따른 LTV 비율 산출 시 수치 대신 'LTV 비율' 문자가 전달되어 정확한 평가가 필요합니다."
      },
      DSRRatio: {
        name_ko: "DSR 비율",
        value: "DSR 비율",
        matched_articles: [
          "제11조",
          "제12조"
        ],
        result: "검토 요망",
        reason: "제11조, 제12조 규정에 따른 DSR 비율 산출 시 수치 대신 'DSR 비율' 문자가 전달되어 정확한 평가가 필요합니다."
      }
      }
    }
  }
};