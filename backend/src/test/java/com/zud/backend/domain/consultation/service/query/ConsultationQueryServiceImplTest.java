package com.zud.backend.domain.consultation.service.query;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.consultation.entity.Consultation;
import com.zud.backend.domain.consultation.exception.ConsultationException;
import com.zud.backend.domain.consultation.repository.ConsultationRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("ConsultationQueryServiceImpl 단위 테스트")
class ConsultationQueryServiceImplTest {

	@Mock
	private ConsultationRepository consultationRepository;
	@InjectMocks
	private ConsultationQueryServiceImpl consultationQueryService;

	@Nested
	@DisplayName("findById()")
	class FindById {

		@Test
		@DisplayName("상담ID_존재시_상담_반환")
		void 상담ID_존재시_상담_반환() {
			// given
			Long consultationId = 1L;
			Consultation consultation = Consultation.builder()
				.id(consultationId)
				.name("홍길동")
				.build();

			given(consultationRepository.findById(consultationId))
				.willReturn(Optional.of(consultation));

			// when
			Consultation result = consultationQueryService.findById(consultationId);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getId()).isEqualTo(consultationId);
			assertThat(result.getName()).isEqualTo("홍길동");
		}

		@Test
		@DisplayName("상담ID_미존재시_ConsultationException_발생")
		void 상담ID_미존재시_ConsultationException_발생() {
			// given
			Long consultationId = 999L;
			given(consultationRepository.findById(consultationId))
				.willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> consultationQueryService.findById(consultationId))
				.isInstanceOf(ConsultationException.class);
		}
	}
}
