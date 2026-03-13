package com.zud.backend.domain.branch.service.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.branch.exception.BranchException;
import com.zud.backend.domain.branch.repository.BranchRepository;
import com.zud.backend.domain.branch.repository.NearestBranchProjection;

@ExtendWith(MockitoExtension.class)
@DisplayName("BranchQueryServiceImpl 단위 테스트")
class BranchQueryServiceImplTest {

	@Mock
	private BranchRepository branchRepository;

	@InjectMocks
	private BranchQueryServiceImpl branchQueryService;

	@Nested
	@DisplayName("findNearestBranch()")
	class FindNearestBranch {

		@Test
		@DisplayName("조회_성공시_NearestBranchProjection_반환")
		void 조회_성공시_NearestBranchProjection_반환() {
			// given
			double longitude = 127.0;
			double latitude = 37.5;
			NearestBranchProjection projection = Mockito.mock(NearestBranchProjection.class);
			given(branchRepository.findNearestBranch(longitude, latitude)).willReturn(Optional.of(projection));

			// when
			NearestBranchProjection result = branchQueryService.findNearestBranch(longitude, latitude);

			// then
			assertThat(result).isSameAs(projection);
			then(branchRepository).should().findNearestBranch(longitude, latitude);
		}

		@Test
		@DisplayName("조회_실패시_BranchException_발생")
		void 조회_실패시_BranchException_발생() {
			// given
			double longitude = 127.0;
			double latitude = 37.5;
			given(branchRepository.findNearestBranch(longitude, latitude)).willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> branchQueryService.findNearestBranch(longitude, latitude))
				.isInstanceOf(BranchException.class);
		}
	}

	@Nested
	@DisplayName("calculateDistanceToBranch()")
	class CalculateDistanceToBranch {

		@Test
		@DisplayName("거리_계산_성공시_거리_반환")
		void 거리_계산_성공시_거리_반환() {
			// given
			Long branchId = 1L;
			double longitude = 127.0;
			double latitude = 37.5;
			double expectedDistance = 123.45;
			given(branchRepository.calculateDistanceToBranch(branchId, longitude, latitude))
				.willReturn(Optional.of(expectedDistance));

			// when
			double result = branchQueryService.calculateDistanceToBranch(branchId, longitude, latitude);

			// then
			assertThat(result).isEqualTo(expectedDistance);
			then(branchRepository).should().calculateDistanceToBranch(branchId, longitude, latitude);
		}

		@Test
		@DisplayName("거리_계산_실패시_BranchException_발생")
		void 거리_계산_실패시_BranchException_발생() {
			// given
			Long branchId = 1L;
			double longitude = 127.0;
			double latitude = 37.5;
			given(branchRepository.calculateDistanceToBranch(branchId, longitude, latitude))
				.willReturn(Optional.empty());

			// when & then
			assertThatThrownBy(() -> branchQueryService.calculateDistanceToBranch(branchId, longitude, latitude))
				.isInstanceOf(BranchException.class);
		}
	}
}

