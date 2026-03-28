/**
 * 가심사 리포트 DTO 조립 로직 유닛 테스트 (13종 서류 기반)
 * 실행 방법: 실제 환경에서 실행하거나, 로직 구조를 확인하는 용도로 사용합니다.
 */
import { createReportRequestPayload } from './report-factory';
import { MOCK_VERIFICATION_RESPONSE } from '@/features/verification/api/verification.mock';
import { Customer } from '@/entities/customer/model/types';
import { MyDataResDto } from '@/entities/audit/model/types';

/**
 * [Test Scenario]
 * 1. 13종 OCR 서류(MOCK_VERIFICATION_RESPONSE)에서 기본 데이터를 추출합니다.
 * 2. 사용자가 화면에서 주소와 배우자 이름을 수정했습니다 (Edits).
 * 3. 근로자(EMPLOYEE) 직업군으로 6개 필수값을 입력했습니다.
 * 4. 마이데이터(신용/대출)가 정상 연동되었습니다.
 */

// 1. 사용자 수정 내역 (Dot-notation)
const mockEditsValues = {
  'currentAddress': '서울시 서초구 반포동(수정됨)',
  'spouse.name': '김배우자(수정)',
  'representativeName': true, // (Rename) hasRepresentativeName -> representativeName
};

// 2. 고객 입력 정보 (Redux)
// (Why) Customer 인터페이스 규격에 맞춰 updatedAt 등 정의되지 않은 필드는 제외합니다.
const mockUserInputData: Customer = {
  consultationId: 'test-uuid-1234',
  name: '홍길동(최종)',
  residentRegistrationNumber: '900101-1234567',
  phoneNumber: '010-1111-2222',
  targetLoanAmount: '200,000,000',
  loanPurpose: '주택구입',
  ownedHouseCount: '1',
  employmentType: '근로자',
};

// 3. 마이데이터 (신용/대출)
const mockMyData: MyDataResDto = {
  userId: 'user-01',
  ratingName: 'A+ (1등급)',
  totalLoanBalance: 200000000,
  totalRemainingLoanBalance: 150000000,
  totalAnnualPrincipalAndInterestRepayment: 12000000,
  loanProducts: []
};

// --- 테스트 실행 ---
// (Why) MOCK_VERIFICATION_RESPONSE를 사용하여 13종 서류 Aggregator 로직을 실질적으로 검증합니다.
const result = createReportRequestPayload(
  MOCK_VERIFICATION_RESPONSE, 
  mockEditsValues,        
  mockUserInputData,      
  mockMyData,             
  mockMyData              
);

console.log('=== [TEST] 최종 조립 DTO 결과 ===');
console.log(JSON.stringify(result, null, 2));

/**
 * [검증 포인트]
 * 1. Aggregation: 초본(Abstract)에서 'moveInDate'가 null이어도 원본 서류에서 잘 가져오는가?
 * 2. Override: 'currentAddress'가 서류상 주소가 아닌 '서울시 서초구...'로 덮어씌워졌는가?
 * 3. Priority: 'name'이 서류상 홍길동이 아닌UserInput의 '홍길동(최종)'인가?
 * 4. Cleaning: 근로자이므로 자영업 필드가 삭제되었는가?
 * 5. MyData: creditRating이 "A+ (1등급)" 문자열 그대로 들어갔는가?
 */
