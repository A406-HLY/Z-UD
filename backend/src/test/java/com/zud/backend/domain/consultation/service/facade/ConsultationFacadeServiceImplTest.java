package com.zud.backend.domain.consultation.service.facade;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.consultation.dto.request.CustomerInfoReqDto;
import com.zud.backend.domain.consultation.dto.response.CustomerInfoResDto;
import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.enums.EmploymentType;
import com.zud.backend.domain.consultation.enums.LoanPurpose;
import com.zud.backend.domain.consultation.service.command.ConsultationCommandService;
import com.zud.backend.domain.consultation.service.query.ConsultationQueryService;


@ExtendWith(MockitoExtension.class)
@DisplayName("ConsultationFacadeServiceImpl 단위 테스트")
class ConsultationFacadeServiceImplTest {

	private static final Long USER_ID = 1L;
	private static final String CONSULTATION_ID = "100L";

	@Mock
	private ConsultationQueryService consultationQueryService;
	@Mock
	private ConsultationCommandService consultationCommandService;

	@InjectMocks
	private ConsultationFacadeServiceImpl consultationFacadeService;


	private CustomerInfoReqDto createDefaultReqDto() {
		return new CustomerInfoReqDto(
			"홍길동",
			"900101-1234567",
			"010-1234-5678",
			EmploymentType.EMPLOYEE,
			300_000_000L,
			LoanPurpose.HOME_PURCHASE,
			1
		);
	}

	@Nested
	@DisplayName("register()")
	class Register {

		@Test
		@DisplayName("고객정보_등록_성공시_응답_반환")
		void 고객정보_등록_성공시_응답_반환() {
			// given
			CustomerInfoReqDto reqDto = createDefaultReqDto();


			given(consultationCommandService.save(any(Consultation.class)))
				.willAnswer(invocation -> {
					Consultation c = invocation.getArgument(0);
					return c.toBuilder().id(CONSULTATION_ID).build();
				});

			// when
			CustomerInfoResDto result = consultationFacadeService.register(USER_ID, reqDto);

			// then
			assertThat(result).isNotNull();
			assertThat(result.id()).isEqualTo(CONSULTATION_ID);
			assertThat(result.name()).isEqualTo("홍길동");
		}



		@Test
		@DisplayName("등록시_상담_저장_호출_및_필드_매핑_확인")
		void 등록시_상담_저장_호출_및_필드_매핑_확인() {
			CustomerInfoReqDto reqDto = createDefaultReqDto();


			given(consultationCommandService.save(any(Consultation.class)))
				.willAnswer(invocation -> {
					Consultation c = invocation.getArgument(0);
					return c.toBuilder().id(CONSULTATION_ID).build();
				});

			// when
			consultationFacadeService.register(USER_ID, reqDto);

			// then
			ArgumentCaptor<Consultation> captor = ArgumentCaptor.forClass(Consultation.class);
			then(consultationCommandService).should().save(captor.capture());

			Consultation saved = captor.getValue();
			assertThat(saved.getName()).isEqualTo("홍길동");
			assertThat(saved.getPhoneNumber()).isEqualTo("010-1234-5678");
			assertThat(saved.getResidentRegistrationNumber()).isEqualTo("900101-1234567");
			assertThat(saved.getEmploymentType()).isEqualTo(EmploymentType.EMPLOYEE);
			assertThat(saved.getTargetLoanAmount()).isEqualTo(300_000_000L);
			assertThat(saved.getLoanPurpose()).isEqualTo(LoanPurpose.HOME_PURCHASE);
			assertThat(saved.getOwnedHouseCount()).isEqualTo(1);
			assertThat(saved.getUserId()).isEqualTo(USER_ID);
		}
	}
}
