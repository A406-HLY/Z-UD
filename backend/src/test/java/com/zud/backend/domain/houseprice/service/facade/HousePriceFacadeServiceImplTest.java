package com.zud.backend.domain.houseprice.service.facade;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.zud.backend.domain.houseprice.dto.response.HousePriceResDto;
import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;
import com.zud.backend.domain.houseprice.entity.HouseTradePrice;
import com.zud.backend.domain.houseprice.service.query.HousePriceQueryService;
import com.zud.backend.domain.houseprice.util.ParsedAddress;

@ExtendWith(MockitoExtension.class)
@DisplayName("HousePriceFacadeServiceImpl 단위 테스트")
class HousePriceFacadeServiceImplTest {

	private static final String HOUSE_TYPE = "아파트";
	private static final String ADDRESS = "서울특별시 서초구 반포동 자하문로36길 16-14 반포아파트 101동 101호";
	@Mock
	private HousePriceQueryService housePriceQueryService;
	@InjectMocks
	private HousePriceFacadeServiceImpl housePriceFacadeService;

	@Nested
	@DisplayName("findHousePrice()")
	class FindHousePrice {

		@Test
		@DisplayName("조회_성공시_QueryService_결과_반환")
		void 조회_성공시_QueryService_결과_반환() {
			HouseTradePrice tradePrice = org.mockito.Mockito.mock(HouseTradePrice.class);
			org.mockito.Mockito.when(tradePrice.getDealAmountManwon()).thenReturn(50000L);

			given(housePriceQueryService.findExactTradePrice(eq("APARTMENT"), any(ParsedAddress.class)))
				.willReturn(Optional.of(tradePrice));

			// when
			HousePriceResDto result = housePriceFacadeService.findHousePrice(HOUSE_TYPE, ADDRESS);

			// then
			assertThat(result.price()).isEqualTo(50000L);
			assertThat(result.priceType()).isEqualTo("실거래가");
		}

		@Test
		@DisplayName("실거래가_없을_때_공시가_조회_성공")
		void 실거래가_없을_때_공시가_조회_성공() {
			given(housePriceQueryService.findExactTradePrice(eq("APARTMENT"), any(ParsedAddress.class)))
				.willReturn(Optional.empty());

			HouseOfficialPrice officialPrice = org.mockito.Mockito.mock(HouseOfficialPrice.class);
			org.mockito.Mockito.when(officialPrice.getOfficialPrice()).thenReturn(600_000_000L); // 6억원 = 60000만원
			given(housePriceQueryService.findExactOfficialPrice(any(ParsedAddress.class)))
				.willReturn(Optional.of(officialPrice));

			// when
			housePriceFacadeService.findHousePrice(HOUSE_TYPE, ADDRESS);

			// then
			HousePriceResDto result = housePriceFacadeService.findHousePrice(HOUSE_TYPE, ADDRESS);
			assertThat(result.price()).isEqualTo(60000L);
			assertThat(result.priceType()).isEqualTo("공시가");
		}
	}
}
