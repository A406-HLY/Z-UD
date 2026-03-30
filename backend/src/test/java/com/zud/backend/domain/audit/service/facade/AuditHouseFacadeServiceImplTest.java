package com.zud.backend.domain.audit.service.facade;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

import java.util.function.Supplier;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.audit.dto.request.AuditHouseReqDto;
import com.zud.backend.domain.audit.dto.response.AuditHouseResDto;
import com.zud.backend.domain.audit.service.notification.HouseAuditNotificationService;
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
	private HouseAuditNotificationService houseAuditNotificationService;

	@InjectMocks
	private AuditHouseFacadeServiceImpl auditFacadeService;

	@BeforeEach
	@SuppressWarnings({"rawtypes", "unchecked"})
	void setUp() {
		doAnswer(invocation -> {
			Runnable action = invocation.getArgument(1);
			action.run();
			return null;
		}).when(houseAuditNotificationService).runIllegalBuildingCheckStep(any(), any(Runnable.class));

		doAnswer(invocation -> {
			Supplier<?> action = invocation.getArgument(1);
			return action.get();
		}).when(houseAuditNotificationService).runNearestBranchCheckStep(any(), any(Supplier.class));

		doAnswer(invocation -> {
			Long stepUserId = invocation.getArgument(0);
			Supplier<?> action = invocation.getArgument(1);
			HouseAuditNotificationService.PriceStepCompletionHandler<?> completionHandler = invocation.getArgument(2);
			Object result = action.get();
			((HouseAuditNotificationService.PriceStepCompletionHandler<Object>)completionHandler)
				.onCompleted(stepUserId, result);
			return result;
		}).when(houseAuditNotificationService).runPriceCheckStep(any(), any(Supplier.class), any());
	}

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
			assertThat(result).isNotNull().isEqualTo(expected);
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
			assertThat(result).isNotNull().isEqualTo(expected);
			then(branchFacadeService).should().findNearestBranch(USER_ID, ADDRESS);
			then(housePriceFacadeService).should()
				.findHousePrice(HOUSE_TYPE, ADDRESS);
		}
	}

}

