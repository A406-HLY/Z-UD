package com.zud.backend.domain.notification.service;

import static org.mockito.BDDMockito.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.zud.backend.domain.notification.dto.request.TestNotificationReqDto;
import com.zud.backend.domain.notification.repository.EmitterRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationFacadeServiceImpl 단위 테스트")
class NotificationFacadeServiceImplTest {

	private static final Long REQUESTER_USER_ID = 10L;
	private static final Long TARGET_USER_ID = 20L;

	@Mock
	private EmitterRepository emitterRepository;

	@Mock
	private JwtDecoder jwtDecoder;

	@Mock
	private SseEmitter emitter;

	@InjectMocks
	private NotificationFacadeServiceImpl notificationFacadeService;

	@Nested
	@DisplayName("sendTestNotification()")
	class SendTestNotification {

		@Test
		@DisplayName("대상_미지정시_요청자에게_테스트_알림_전송")
		void 대상_미지정시_요청자에게_테스트_알림_전송() throws Exception {
			// given
			TestNotificationReqDto reqDto = new TestNotificationReqDto(null, null, null, null);
			given(emitterRepository.findByUserId(REQUESTER_USER_ID)).willReturn(emitter);

			// when
			notificationFacadeService.sendTestNotification(REQUESTER_USER_ID, reqDto);

			// then
			then(emitterRepository).should().findByUserId(REQUESTER_USER_ID);
			then(emitter).should().send(Mockito.any(SseEmitter.SseEventBuilder.class));
		}

		@Test
		@DisplayName("대상_지정시_해당_사용자에게_테스트_알림_전송")
		void 대상_지정시_해당_사용자에게_테스트_알림_전송() throws Exception {
			// given
			TestNotificationReqDto reqDto = new TestNotificationReqDto(TARGET_USER_ID, null, null, null);
			given(emitterRepository.findByUserId(TARGET_USER_ID)).willReturn(emitter);

			// when
			notificationFacadeService.sendTestNotification(REQUESTER_USER_ID, reqDto);

			// then
			then(emitterRepository).should().findByUserId(TARGET_USER_ID);
			then(emitter).should().send(Mockito.any(SseEmitter.SseEventBuilder.class));
		}
	}
}

