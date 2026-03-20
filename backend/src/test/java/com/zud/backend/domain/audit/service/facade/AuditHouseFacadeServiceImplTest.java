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

import com.zud.backend.domain.audit.dto.request.AuditHouseReqDto;
import com.zud.backend.domain.audit.dto.request.MyDataReqDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.audit.dto.response.MyDataResDto;
import com.zud.backend.domain.branch.dto.response.NearestBranchResDto;
import com.zud.backend.domain.branch.service.facade.BranchFacadeService;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.service.facade.HousePriceFacadeService;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditFacadeServiceImpl 단위 테스트")
class AuditHouseFacadeServiceImplTest {

	private static final Long USER_ID = 1L;
	private static final String ADDRESS = "서울특별시 강남구 테헤란로 212";
	private static final String HOUSE_TYPE = "아파트";
	private static final String HOUSE_PRICE_MANUAL_INPUT_MESSAGE = "주택 시세 조회가 불가해 수기로 입력해주세요.";

	@Mock
	private BranchFacadeService branchFacadeService;

	@Mock
	private HousePriceFacadeService housePriceFacadeService;

	@Mock
	private AuditMyDataFacadeService myDataService;

	@InjectMocks
	private AuditHouseFacadeServiceImpl auditFacadeService;

	@Nested
	@DisplayName("auditHouse()")
	class AuditHouse {

		@Test
		@DisplayName("심사_결과를_AuditResDto에_조립")
		void 심사_결과를_AuditResDto에_조립() {
			// given
			AuditHouseReqDto reqDto = AuditHouseReqDto.builder()
				.illegalBuilding(false)
				.houseType(HOUSE_TYPE)
				.propertyAddress(ADDRESS)
				.build();

			NearestBranchResDto nearestBranchResDto = org.mockito.Mockito.mock(NearestBranchResDto.class);
			HousePriceResDto housePriceResDto =
				new HousePriceResDto(1_000L, "실거래가", "실거래가 기준으로 조회되었습니다.");
			AuditHouseResDto expected = AuditHouseResDto.builder()
				.illegalBuilding(false)
				.nearestBranch(nearestBranchResDto)
				.supportedHouseType(true)
				.housePrice(housePriceResDto)
				.build();

			given(branchFacadeService.findNearestBranch(USER_ID, ADDRESS))
				.willReturn(nearestBranchResDto);
			given(housePriceFacadeService.findHousePrice(HOUSE_TYPE, ADDRESS))
				.willReturn(housePriceResDto);

			// when
			AuditHouseResDto result = auditFacadeService.auditHouse(USER_ID, reqDto);

			// then
			assertThat(result).isNotNull();
			assertThat(result).isEqualTo(expected);
			then(branchFacadeService).should().findNearestBranch(USER_ID, ADDRESS);
			then(housePriceFacadeService).should()
				.findHousePrice(HOUSE_TYPE, ADDRESS);
		}

		@Test
		@DisplayName("주택유형은_지원되지만_시세조회_불가시_housePrice_null_메시지_반환")
		void 주택유형은_지원되지만_시세조회_불가시_housePrice_null_메시지_반환() {
			// given
			AuditHouseReqDto reqDto = AuditHouseReqDto.builder()
				.illegalBuilding(false)
				.houseType(HOUSE_TYPE)
				.propertyAddress(ADDRESS)
				.build();

			NearestBranchResDto nearestBranchResDto = org.mockito.Mockito.mock(NearestBranchResDto.class);
			HousePriceResDto nullHousePrice = HousePriceResDto.builder()
				.price(null)
				.priceType(null)
				.message(HOUSE_PRICE_MANUAL_INPUT_MESSAGE)
				.build();
			AuditHouseResDto expected = AuditHouseResDto.builder()
				.illegalBuilding(false)
				.nearestBranch(nearestBranchResDto)
				.supportedHouseType(true)
				.housePrice(nullHousePrice)
				.build();

			given(branchFacadeService.findNearestBranch(USER_ID, ADDRESS))
				.willReturn(nearestBranchResDto);
			given(housePriceFacadeService.findHousePrice(HOUSE_TYPE, ADDRESS))
				.willReturn(null);

			// when
			AuditHouseResDto result = auditFacadeService.auditHouse(USER_ID, reqDto);

			// then
			assertThat(result).isNotNull();
			assertThat(result).isEqualTo(expected);
			then(branchFacadeService).should().findNearestBranch(USER_ID, ADDRESS);
			then(housePriceFacadeService).should()
				.findHousePrice(HOUSE_TYPE, ADDRESS);
		}
	}

	@Test
	@DisplayName("getMyData는_분리된_MyDataService를_호출한다")
	void getMyData는_분리된_MyDataService를_호출한다() {
		// given
		MyDataReqDto reqDto = new MyDataReqDto("zud@ssafy.co.kr");
		MyDataResDto expected = new MyDataResDto("zud@ssafy.co.kr", "A", "0", "0", java.util.List.of());
		given(myDataService.getMyData(reqDto)).willReturn(expected);

		// when
		MyDataResDto result = auditFacadeService.getMyData(reqDto);

		// then
		assertThat(result).isEqualTo(expected);
		then(myDataService).should().getMyData(reqDto);
	}
}

