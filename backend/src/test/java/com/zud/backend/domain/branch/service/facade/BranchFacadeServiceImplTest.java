package com.zud.backend.domain.branch.service.facade;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.branch.client.AddressGeocodingClient;
import com.zud.backend.domain.branch.client.dto.CoordinateResultDto;
import com.zud.backend.domain.branch.converter.BranchConverter;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.branch.repository.NearestBranchProjection;
import com.zud.backend.domain.branch.service.query.BranchQueryServiceImpl;
import com.zud.backend.domain.user.entity.User;
import com.zud.backend.domain.user.service.query.UserQueryService;

@ExtendWith(MockitoExtension.class)
@DisplayName("BranchFacadeServiceImpl 단위 테스트")
class BranchFacadeServiceImplTest {

	private static final String EMPLOYEE_NUMBER = "EMP001";
	private static final String ADDRESS = "서울특별시 강남구 테헤란로 212";
	private static final double LATITUDE = 37.501;
	private static final double LONGITUDE = 127.039;

	@Mock
	private UserQueryService userQueryService;

	@Mock
	private AddressGeocodingClient addressGeocodingClient;

	@Mock
	private BranchQueryServiceImpl branchQueryService;

	@Mock
	private BranchConverter branchConverter;

	@InjectMocks
	private BranchFacadeServiceImpl branchFacadeService;

	private User createDefaultUser() {
		Branch branch = Branch.builder()
			.id(1L)
			.name("세종")
			.fullAddress("세종특별자치시 나리로 16")
			.longitude(127.0)
			.latitude(37.0)
			.build();

		return User.builder()
			.id(10L)
			.employeeNumber(EMPLOYEE_NUMBER)
			.name("홍길동")
			.password("$2a$encodedPassword")
			.branch(branch)
			.build();
	}

	@Nested
	@DisplayName("findNearestBranch()")
	class FindNearestBranch {

		@Test
		@DisplayName("조회_성공시_converter_결과_반환")
		void 조회_성공시_converter_결과_반환() {
			// given
			User user = createDefaultUser();
			Long userId = user.getId();
			CoordinateResultDto coordinate = new CoordinateResultDto(LATITUDE, LONGITUDE);
			NearestBranchProjection nearestBranch = Mockito.mock(NearestBranchProjection.class);
			double currentBranchDistanceMeter = 100.0;
			NearestBranchResDto expected = new NearestBranchResDto(
				false,
				"세종",
				"세종특별자치시 나리로 16",
				currentBranchDistanceMeter,
				"강남",
				"서울특별시 강남구 테헤란로 212",
				10.0,
				"현재 근무 지점은 해당 건물과 가장 가까운 지점이 아닙니다."
			);

			given(userQueryService.findById(user.getId())).willReturn(user);
			given(addressGeocodingClient.getCoordinates(ADDRESS)).willReturn(coordinate);
			given(branchQueryService.findNearestBranch(LONGITUDE, LATITUDE)).willReturn(nearestBranch);
			given(branchQueryService.calculateDistanceToBranch(1L, LONGITUDE, LATITUDE))
				.willReturn(currentBranchDistanceMeter);
			given(branchConverter.toNearestBranchResDto(user.getBranch(), currentBranchDistanceMeter, nearestBranch))
				.willReturn(expected);

			// when
			NearestBranchResDto result = branchFacadeService.findNearestBranch(userId, ADDRESS);

			// then
			assertThat(result).isSameAs(expected);
		}

		@Test
		@DisplayName("조회_성공시_의존성_호출_인자_검증")
		void 조회_성공시_의존성_호출_인자_검증() {
			// given
			User user = createDefaultUser();
			Long userId = user.getId();
			CoordinateResultDto coordinate = new CoordinateResultDto(LATITUDE, LONGITUDE);
			NearestBranchProjection nearestBranch = Mockito.mock(NearestBranchProjection.class);
			double currentBranchDistanceMeter = 100.0;
			NearestBranchResDto expected = Mockito.mock(NearestBranchResDto.class);

			given(userQueryService.findById(user.getId())).willReturn(user);
			given(addressGeocodingClient.getCoordinates(ADDRESS)).willReturn(coordinate);
			given(branchQueryService.findNearestBranch(LONGITUDE, LATITUDE)).willReturn(nearestBranch);
			given(branchQueryService.calculateDistanceToBranch(1L, LONGITUDE, LATITUDE))
				.willReturn(currentBranchDistanceMeter);
			given(branchConverter.toNearestBranchResDto(user.getBranch(), currentBranchDistanceMeter, nearestBranch))
				.willReturn(expected);

			// when
			branchFacadeService.findNearestBranch(userId, ADDRESS);

			// then
			then(userQueryService).should().findById(user.getId());
			then(addressGeocodingClient).should().getCoordinates(ADDRESS);
			then(branchQueryService).should().findNearestBranch(LONGITUDE, LATITUDE);
			then(branchQueryService).should().calculateDistanceToBranch(1L, LONGITUDE, LATITUDE);
			then(branchConverter).should()
				.toNearestBranchResDto(user.getBranch(), currentBranchDistanceMeter, nearestBranch);
		}
	}
}

