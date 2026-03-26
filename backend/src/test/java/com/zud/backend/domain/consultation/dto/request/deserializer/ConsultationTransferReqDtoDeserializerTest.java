package com.zud.backend.domain.consultation.dto.request.deserializer;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto.EmployeeReportInput;
import com.zud.backend.domain.consultation.dto.request.ConsultationTransferReqDto.SelfEmployedReportInput;
import com.zud.backend.domain.consultation.enums.EmploymentType;

import tools.jackson.databind.ObjectMapper;

@DisplayName("ConsultationTransferReqDtoDeserializer 단위 테스트")
class ConsultationTransferReqDtoDeserializerTest {

	private final ObjectMapper objectMapper = new ObjectMapper();

	@Nested
	@DisplayName("deserialize()")
	class Deserialize {

		@Test
		@DisplayName("근로자_요청_역직렬화_성공")
		void 근로자_요청_역직렬화_성공() throws Exception {
			// given
			String json = """
				{
				  "reportInput": {
				    "name": "홍길동",
				    "residentRegistrationNumber": "900101-1234567",
				    "phoneNumber": "010-1234-5678",
				    "targetLoanAmount": 200000000,
				    "loanPurpose": "HOME_PURCHASE",
				    "ownedHouseCount": 0,
				    "employmentType": "EMPLOYEE",
				    "annualIncomeTotal": 70000000
				  }
				}
				""";

			// when
			ConsultationTransferReqDto result = objectMapper.readValue(json, ConsultationTransferReqDto.class);

			// then
			assertThat(result.reportInput()).isInstanceOf(EmployeeReportInput.class);
			EmployeeReportInput reportInput = (EmployeeReportInput)result.reportInput();
			assertThat(reportInput.employmentType()).isEqualTo(EmploymentType.EMPLOYEE);
			assertThat(reportInput.name()).isEqualTo("홍길동");
			assertThat(reportInput.annualIncomeTotal()).isEqualTo(70_000_000L);
		}

		@Test
		@DisplayName("개인사업자_요청_역직렬화_성공")
		void 개인사업자_요청_역직렬화_성공() throws Exception {
			// given
			String json = """
				{
				  "reportInput": {
				    "name": "홍길동",
				    "residentRegistrationNumber": "900101-1234567",
				    "phoneNumber": "010-1234-5678",
				    "targetLoanAmount": 200000000,
				    "loanPurpose": "HOME_PURCHASE",
				    "ownedHouseCount": 0,
				    "employmentType": "SELF_EMPLOYED",
				    "businessName": "홍길상회",
				    "incomeAmount": 85000000
				  }
				}
				""";

			// when
			ConsultationTransferReqDto result = objectMapper.readValue(json, ConsultationTransferReqDto.class);

			// then
			assertThat(result.reportInput()).isInstanceOf(SelfEmployedReportInput.class);
			SelfEmployedReportInput reportInput = (SelfEmployedReportInput)result.reportInput();
			assertThat(reportInput.employmentType()).isEqualTo(EmploymentType.SELF_EMPLOYED);
			assertThat(reportInput.businessName()).isEqualTo("홍길상회");
			assertThat(reportInput.incomeAmount()).isEqualTo(85_000_000L);
		}

		@Test
		@DisplayName("고용형태_누락시_예외_발생")
		void 고용형태_누락시_예외_발생() {
			// given
			String json = """
				{
				  "reportInput": {
				    "name": "홍길동"
				    }
				}
				""";

			// when // then
			assertThatThrownBy(
				() -> objectMapper.readValue(json, ConsultationTransferReqDto.class)).hasMessageContaining(
				"employmentType 은 필수 입력값 입니다.");
		}
	}
}
