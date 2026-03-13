package com.zud.backend.domain.audit.service.facade;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.audit.converter.AuditConverter;
import com.zud.backend.domain.audit.dto.request.AuditReqDto;
import com.zud.backend.domain.audit.dto.response.AuditResDto;
import com.zud.backend.domain.branch.dto.request.NearestBranchReqDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.service.facade.BranchFacadeService;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditFacadeServiceImpl 단위 테스트")
class AuditFacadeServiceImplTest {

	private static final Long USER_ID = 1L;
	private static final String ADDRESS = "서울특별시 강남구 테헤란로 212";

	@Mock
	private BranchFacadeService branchFacadeService;

	@Mock
	private AuditConverter auditConverter;

	@InjectMocks
	private AuditFacadeServiceImpl auditFacadeService;

	@Nested
	@DisplayName("audit()")
	class Audit {

		@Test
		@DisplayName("nearestBranch_검사_결과를_AuditResDto에_조립")
		void nearestBranch_검사_결과를_AuditResDto에_조립() {
			// given
			NearestBranchReqDto nearestBranchReqDto = new NearestBranchReqDto(ADDRESS);
			AuditReqDto reqDto = new AuditReqDto(nearestBranchReqDto);

			NearestBranchResDto nearestBranchResDto = org.mockito.Mockito.mock(NearestBranchResDto.class);
			AuditResDto expected = AuditResDto.builder()
				.nearestBranch(nearestBranchResDto)
				.build();
			given(branchFacadeService.findNearestBranch(USER_ID, nearestBranchReqDto))
				.willReturn(nearestBranchResDto);
			given(auditConverter.toAuditResDto(nearestBranchResDto)).willReturn(expected);

			// when
			AuditResDto result = auditFacadeService.audit(USER_ID, reqDto);

			// then
			assertThat(result).isNotNull();
			assertThat(result).isSameAs(expected);
			then(branchFacadeService).should().findNearestBranch(USER_ID, nearestBranchReqDto);
			then(auditConverter).should().toAuditResDto(nearestBranchResDto);
		}
	}
}

