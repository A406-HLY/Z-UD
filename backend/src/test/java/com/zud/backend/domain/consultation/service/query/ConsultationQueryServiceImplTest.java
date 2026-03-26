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
	@DisplayName("findByUuid()")
	class FindByUuid {

		@Test
		@DisplayName("상담UUID_존재시_상담_반환")
		void 상담UUID_존재시_상담_반환() {
			// given
			String uuid = "some-external-uuid";
			Consultation consultation = Consultation.builder()
				.id(uuid)
				.name("홍길동")
				.build();

			given(consultationRepository.findById(uuid))
				.willReturn(Optional.of(consultation));

			// when
			Consultation result = consultationQueryService.findByUuid(uuid);

			// then
			assertThat(result).isNotNull();
			assertThat(result.getId()).isEqualTo(uuid);
			assertThat(result.getName()).isEqualTo("홍길동");
		}

		@Test
		@DisplayName("상담UUID_미존재시_ConsultationException_발생")
		void 상담UUID_미존재시_ConsultationException_발생() {
			// given
			String uuid = "invalid-uuid";
			given(consultationRepository.findById(uuid))
				.willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> consultationQueryService.findByUuid(uuid))
				.isInstanceOf(ConsultationException.class);
		}
	}
}
