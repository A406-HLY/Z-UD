package com.zud.backend.domain.houseprice.service.facade;

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

import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.service.query.HousePriceQueryService;

@ExtendWith(MockitoExtension.class)
@DisplayName("HousePriceFacadeServiceImpl 단위 테스트")
class HousePriceFacadeServiceImplTest {

	@Mock
	private HousePriceQueryService housePriceQueryService;

	@InjectMocks
	private HousePriceFacadeServiceImpl housePriceFacadeService;

	private static final String HOUSE_TYPE = "아파트";
	private static final String ADDRESS = "서울특별시 서초구 반포동 1-1 반포아파트 101동 101호";

	@Nested
	@DisplayName("findHousePrice()")
	class FindHousePrice {

		@Test
		@DisplayName("조회_성공시_QueryService_결과_반환")
		void 조회_성공시_QueryService_결과_반환() {
			// given
			HousePriceResDto expected = HousePriceResDto.builder()
				.price(50000L)
				.priceType("실거래가")
				.message("실거래가 기준으로 조회되었습니다.")
				.build();

			given(housePriceQueryService.findHousePrice(HOUSE_TYPE, ADDRESS))
				.willReturn(expected);

			// when
			HousePriceResDto result = housePriceFacadeService.findHousePrice(HOUSE_TYPE, ADDRESS);

			// then
			assertThat(result).isSameAs(expected);
			then(housePriceQueryService).should().findHousePrice(HOUSE_TYPE, ADDRESS);
		}

		@Test
		@DisplayName("조회_성공시_의존성_호출_인자_검증")
		void 조회_성공시_의존성_호출_인자_검증() {
			// given
			HousePriceResDto expected = HousePriceResDto.builder()
				.price(50000L)
				.priceType("실거래가")
				.message("실거래가 기준으로 조회되었습니다.")
				.build();

			given(housePriceQueryService.findHousePrice(HOUSE_TYPE, ADDRESS))
				.willReturn(expected);

			// when
			housePriceFacadeService.findHousePrice(HOUSE_TYPE, ADDRESS);

			// then
			then(housePriceQueryService).should().findHousePrice(HOUSE_TYPE, ADDRESS);
		}
	}
}
