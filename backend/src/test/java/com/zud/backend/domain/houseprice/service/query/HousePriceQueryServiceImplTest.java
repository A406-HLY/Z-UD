package com.zud.backend.domain.houseprice.service.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.common.error.ErrorCode;
import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
import com.zud.backend.domain.houseprice.entity.HouseTradePrice;
import com.zud.backend.domain.houseprice.exception.HousePriceException;
import com.zud.backend.domain.houseprice.service.facade.HousePriceFacadeServiceImpl;
import com.zud.backend.domain.houseprice.repository.HouseOfficialPriceRepository;
import com.zud.backend.domain.houseprice.repository.HouseTradePriceRepository;

@ExtendWith(MockitoExtension.class)
@DisplayName("HousePriceQueryServiceImpl 단위 테스트")
class HousePriceQueryServiceImplTest {

	@Mock
	private HouseTradePriceRepository houseTradePriceRepository;

	@Mock
	private HouseOfficialPriceRepository houseOfficialPriceRepository;

	@InjectMocks
	private HousePriceQueryServiceImpl housePriceQueryServiceImpl;

	private HousePriceFacadeServiceImpl housePriceQueryService;

	@BeforeEach
	void setUpFacade() throws Exception {
		// Lombok's @RequiredArgsConstructor(access = PROTECTED) 이라서 리플렉션으로 생성합니다.
		var ctor = HousePriceFacadeServiceImpl.class.getDeclaredConstructor(
			com.zud.backend.domain.houseprice.service.query.HousePriceQueryService.class
		);
		ctor.setAccessible(true);
		housePriceQueryService = (HousePriceFacadeServiceImpl)ctor.newInstance(housePriceQueryServiceImpl);
	}

	private static final String VALID_ADDRESS = "서울특별시 서초구 반포동 자하문로36길 16-14 반포아파트 101동 101호";
	private static final String VALID_HOUSE_TYPE = "아파트";

	@Nested
	@DisplayName("findHousePrice()")
	class FindHousePrice {

		@Nested
		@DisplayName("주택 유형 검증")
		class HouseTypeValidation {

			@Test
			@DisplayName("주택_유형이_null이면_HousePriceException_발생")
			void 주택_유형이_null이면_HousePriceException_발생() {
				// when & then
				assertThatThrownBy(() -> housePriceQueryService.findHousePrice(null, VALID_ADDRESS))
					.isInstanceOf(HousePriceException.class)
					.satisfies(exception -> {
						HousePriceException housePriceException = (HousePriceException)exception;
						assertThat(housePriceException.getErrorCode()).isEqualTo(ErrorCode.INVALID_HOUSE_TYPE);
					});
			}

			@Test
			@DisplayName("주택_유형이_잘못된_값이면_HousePriceException_발생")
			void 주택_유형이_잘못된_값이면_HousePriceException_발생() {
				// when & then
				assertThatThrownBy(() -> housePriceQueryService.findHousePrice("오피스텔", VALID_ADDRESS))
					.isInstanceOf(HousePriceException.class)
					.satisfies(exception -> {
						HousePriceException housePriceException = (HousePriceException)exception;
						assertThat(housePriceException.getErrorCode()).isEqualTo(ErrorCode.INVALID_HOUSE_TYPE);
					});
			}

			@Test
			@DisplayName("주택_유형이_아파트면_성공")
			void 주택_유형이_아파트면_성공() {
				// given
				HouseTradePrice tradePrice = createTradePrice(50000L);
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(tradePrice);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice("아파트", VALID_ADDRESS);

				// then
				assertThat(result.price()).isEqualTo(50000L);
				assertThat(result.priceType()).isEqualTo("실거래가");
			}

			@Test
			@DisplayName("주택_유형이_다세대연립이면_성공")
			void 주택_유형이_다세대연립이면_성공() {
				// given
				String address = "서울특별시 강남구 역삼동 테헤란로 212 다세대연립 201호";
				HouseTradePrice tradePrice = createTradePrice(30000L);
				given(houseTradePriceRepository.findMultiHouseholdExactMatch(
					"서울특별시 강남구 역삼동", "테헤란로 212", "다세대연립", null
				)).willReturn(tradePrice);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice("다세대연립", address);

				// then
				assertThat(result.price()).isEqualTo(30000L);
				assertThat(result.priceType()).isEqualTo("실거래가");
			}

			@Test
			@DisplayName("주택_유형이_단독이면_성공")
			void 주택_유형이_단독이면_성공() {
				// given
				String address = "서울특별시 강남구 역삼동 테헤란로 212 단독주택";
				HouseTradePrice tradePrice = createTradePrice(80000L);
				given(houseTradePriceRepository.findSingleHouseExactMatch(
					"서울특별시 강남구 역삼동", "테헤란로 212", "단독주택"
				)).willReturn(tradePrice);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice("단독", address);

				// then
				assertThat(result.price()).isEqualTo(80000L);
				assertThat(result.priceType()).isEqualTo("실거래가");
			}
		}

		@Nested
		@DisplayName("주소 파싱")
		class AddressParsing {

			@Test
			@DisplayName("주소_형식이_잘못되면_HousePriceException_발생")
			void 주소_형식이_잘못되면_HousePriceException_발생() {
				// when & then
				assertThatThrownBy(() -> housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, "잘못된 주소"))
					.isInstanceOf(HousePriceException.class)
					.satisfies(exception -> {
						HousePriceException housePriceException = (HousePriceException)exception;
						assertThat(housePriceException.getErrorCode()).isEqualTo(ErrorCode.INVALID_ADDRESS_FORMAT);
					});
			}
		}

		@Nested
		@DisplayName("가격 조회 우선순위")
		class PriceLookupPriority {

			@Test
			@DisplayName("1순위_실거래가_조회_성공")
			void 실거래가_조회_성공() {
				// given
				HouseTradePrice tradePrice = createTradePrice(50000L);
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(tradePrice);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, VALID_ADDRESS);

				// then
				assertThat(result.price()).isEqualTo(50000L);
				assertThat(result.priceType()).isEqualTo("실거래가");
				assertThat(result.message()).isEqualTo("실거래가 기준으로 조회되었습니다.");
				then(houseTradePriceRepository).should().findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				);
				then(houseOfficialPriceRepository).shouldHaveNoInteractions();
			}

			@Test
			@DisplayName("2순위_공시가_조회_성공_실거래가_없을_때")
			void 공시가_조회_성공_실거래가_없을_때() {
				// given
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(null);

				HouseOfficialPrice officialPrice = createOfficialPrice(600000000L); // 6억원 = 60000만원
				given(houseOfficialPriceRepository.findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				)).willReturn(officialPrice);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, VALID_ADDRESS);

				// then
				assertThat(result.price()).isEqualTo(60000L);
				assertThat(result.priceType()).isEqualTo("공시가");
				assertThat(result.message()).isEqualTo("공시가 기준으로 조회되었습니다.");
				then(houseTradePriceRepository).should().findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				);
				then(houseOfficialPriceRepository).should().findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				);
			}

			@Test
			@DisplayName("3순위_근삿값_조회_성공_실거래가_우선")
			void 근삿값_조회_성공_실거래가_우선() {
				// given
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(null);
				given(houseOfficialPriceRepository.findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				)).willReturn(null);

				// 실거래가 근삿값
				List<HouseTradePrice> tradePrices = new ArrayList<>();
				tradePrices.add(createTradePrice(40000L));
				tradePrices.add(createTradePrice(45000L));
				tradePrices.add(createTradePrice(50000L));
				given(houseTradePriceRepository.findLowestPricesByBuildingDetail(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트",
					"101",
					null
				)).willReturn(tradePrices);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, VALID_ADDRESS);

				// then
				assertThat(result.price()).isEqualTo(45000L); // (40000 + 45000 + 50000) / 3 = 45000
				assertThat(result.priceType()).isEqualTo("근삿값");
				assertThat(result.message()).isEqualTo("같은 동의 낮은 주택가 평균값으로 조회되었습니다.");
				then(houseTradePriceRepository).should().findLowestPricesByBuildingDetail(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트",
					"101",
					null
				);
				// 실거래가에서 근삿값을 찾으면 공시가 근삿값 조회는 호출되지 않아야 함
				then(houseOfficialPriceRepository).should().findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				);
				then(houseOfficialPriceRepository).shouldHaveNoMoreInteractions();
			}

			@Test
			@DisplayName("3순위_근삿값_조회_성공_공시가_차순위")
			void 근삿값_조회_성공_공시가_차순위() {
				// given
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(null);
				given(houseOfficialPriceRepository.findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				)).willReturn(null);
				given(houseTradePriceRepository.findLowestPricesByBuildingDetail(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트",
					"101",
					null
				)).willReturn(new ArrayList<>());
				given(houseTradePriceRepository.findLowestPricesByBuilding(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트"
				)).willReturn(new ArrayList<>());

				// 공시가 근삿값
				List<HouseOfficialPrice> officialPrices = new ArrayList<>();
				officialPrices.add(createOfficialPrice(500000000L)); // 5억원 = 50000만원
				officialPrices.add(createOfficialPrice(550000000L)); // 5.5억원 = 55000만원
				officialPrices.add(createOfficialPrice(600000000L)); // 6억원 = 60000만원
				given(houseOfficialPriceRepository.findLowestPricesByBuildingDetail(
					"서울특별시 서초구 반포동 자하문로36길 16-14",
					"반포아파트",
					"101",
					"101"
				)).willReturn(officialPrices);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, VALID_ADDRESS);

				// then
				assertThat(result.price()).isEqualTo(55000L); // (50000 + 55000 + 60000) / 3 = 55000
				assertThat(result.priceType()).isEqualTo("근삿값");
				assertThat(result.message()).isEqualTo("같은 동의 낮은 주택가 평균값으로 조회되었습니다.");
			}

			@Test
			@DisplayName("모든_조회_실패시_HousePriceException_발생")
			void 모든_조회_실패시_HousePriceException_발생() {
				// given
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(null);
				given(houseOfficialPriceRepository.findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				)).willReturn(null);
				given(houseTradePriceRepository.findLowestPricesByBuildingDetail(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트",
					"101",
					null
				)).willReturn(new ArrayList<>());
				given(houseTradePriceRepository.findLowestPricesByBuilding(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트"
				)).willReturn(new ArrayList<>());
				given(houseOfficialPriceRepository.findLowestPricesByBuildingDetail(
					"서울특별시 서초구 반포동 자하문로36길 16-14",
					"반포아파트",
					"101",
					"101"
				)).willReturn(new ArrayList<>());
				given(houseOfficialPriceRepository.findLowestPricesByBuilding(
					"서울특별시 서초구 반포동 자하문로36길 16-14",
					"반포아파트"
				)).willReturn(new ArrayList<>());

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, VALID_ADDRESS);

				// then
				assertThat(result).isNull();
			}
		}

		@Nested
		@DisplayName("근삿값 계산")
		class EstimatedPriceCalculation {

			@Test
			@DisplayName("근삿값_5개_미만일때_평균_계산")
			void 근삿값_5개_미만일때_평균_계산() {
				// given
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(null);
				given(houseOfficialPriceRepository.findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				)).willReturn(null);

				List<HouseTradePrice> tradePrices = new ArrayList<>();
				tradePrices.add(createTradePrice(30000L));
				tradePrices.add(createTradePrice(40000L));
				given(houseTradePriceRepository.findLowestPricesByBuildingDetail(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트",
					"101",
					null
				)).willReturn(tradePrices);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, VALID_ADDRESS);

				// then
				assertThat(result.price()).isEqualTo(35000L); // (30000 + 40000) / 2 = 35000
				assertThat(result.priceType()).isEqualTo("근삿값");
			}

			@Test
			@DisplayName("근삿값_5개일때_평균_계산")
			void 근삿값_5개일때_평균_계산() {
				// given
				given(houseTradePriceRepository.findApartmentExactMatch(
					"서울특별시 서초구 반포동", "자하문로36길 16-14", "반포아파트", "101", null
				)).willReturn(null);
				given(houseOfficialPriceRepository.findExactMatch(
					"서울특별시 서초구 반포동 자하문로36길 16-14", "반포아파트", "101", "101"
				)).willReturn(null);

				List<HouseTradePrice> tradePrices = new ArrayList<>();
				tradePrices.add(createTradePrice(30000L));
				tradePrices.add(createTradePrice(35000L));
				tradePrices.add(createTradePrice(40000L));
				tradePrices.add(createTradePrice(45000L));
				tradePrices.add(createTradePrice(50000L));
				given(houseTradePriceRepository.findLowestPricesByBuildingDetail(
					"APARTMENT",
					"서울특별시 서초구 반포동",
					"자하문로36길 16-14",
					"반포아파트",
					"101",
					null
				)).willReturn(tradePrices);

				// when
				HousePriceResDto result = housePriceQueryService.findHousePrice(VALID_HOUSE_TYPE, VALID_ADDRESS);

				// then
				assertThat(result.price()).isEqualTo(40000L); // (30000 + 35000 + 40000 + 45000 + 50000) / 5 = 40000
				assertThat(result.priceType()).isEqualTo("근삿값");
			}
		}
	}

	private HouseTradePrice createTradePrice(Long dealAmountManwon) {
		return HouseTradePrice.builder()
			.houseType("APARTMENT")
			.sigungu("서울특별시 서초구 반포동")
			.roadName("자하문로36길 16-14")
			.buildingName("반포아파트")
			.buildingDong("101")
			.dealAmountManwon(dealAmountManwon)
			.contractYearMonth(202401)
			.contractDay((short)15)
			.build();
	}

	private HouseOfficialPrice createOfficialPrice(Long officialPrice) {
		return HouseOfficialPrice.builder()
			.sido("서울특별시")
			.sigungu("서초구")
			.dongRi("반포동")
			.complexName("반포아파트")
			.dongName("101")
			.hoName("101")
			.officialPrice(officialPrice)
			.stdYear(2024)
			.stdMonth((short)1)
			.legalDongCode("1165010100")
			.roadAddress("서울특별시 서초구 반포동 자하문로36길 16-14")
			.build();
	}
}
