package com.zud.backend.domain.houseprice.util;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@DisplayName("AddressParser 단위 테스트")
class AddressParserTest {

	@Nested
	@DisplayName("parse()")
	class Parse {

		@Test
		@DisplayName("정상적인_주소_파싱_성공")
		void 정상적인_주소_파싱_성공() {
			// given
			String address = "서울특별시 서초구 반포동 자하문로36길 16-14 반포아파트 101동 101호";

			// when
			ParsedAddress result = AddressParser.parse(address);

			// then
			assertThat(result.getSido()).isEqualTo("서울특별시");
			assertThat(result.getSigungu()).isEqualTo("서초구");
			assertThat(result.getDongRi()).isEqualTo("반포동");
			assertThat(result.getRoadAddress()).isEqualTo("서울특별시 서초구 반포동 자하문로36길 16-14");
			assertThat(result.getRoadName()).isEqualTo("자하문로36길 16-14");
			assertThat(result.getBuildingName()).isEqualTo("반포아파트");
			assertThat(result.getBuildingDong()).isEqualTo("101");
			assertThat(result.getHo()).isEqualTo("101");
		}

		@Test
		@DisplayName("동이_없는_주소_파싱_성공")
		void 동이_없는_주소_파싱_성공() {
			// given
			String address = "서울특별시 강남구 역삼동 테헤란로 212 테헤란아파트 301호";

			// when
			ParsedAddress result = AddressParser.parse(address);

			// then
			assertThat(result.getSido()).isEqualTo("서울특별시");
			assertThat(result.getSigungu()).isEqualTo("강남구");
			assertThat(result.getDongRi()).isEqualTo("역삼동");
			assertThat(result.getRoadAddress()).isEqualTo("서울특별시 강남구 역삼동 테헤란로 212");
			assertThat(result.getRoadName()).isEqualTo("테헤란로 212");
			assertThat(result.getBuildingName()).isEqualTo("테헤란아파트");
			assertThat(result.getBuildingDong()).isNull();
			assertThat(result.getHo()).isEqualTo("301");
		}

		@Test
		@DisplayName("호수가_없는_주소_파싱_성공")
		void 호수가_없는_주소_파싱_성공() {
			// given
			String address = "서울특별시 서초구 반포동 자하문로36길 16-14 반포아파트 101동";

			// when
			ParsedAddress result = AddressParser.parse(address);

			// then
			assertThat(result.getSido()).isEqualTo("서울특별시");
			assertThat(result.getSigungu()).isEqualTo("서초구");
			assertThat(result.getDongRi()).isEqualTo("반포동");
			assertThat(result.getRoadAddress()).isEqualTo("서울특별시 서초구 반포동 자하문로36길 16-14");
			assertThat(result.getRoadName()).isEqualTo("자하문로36길 16-14");
			assertThat(result.getBuildingName()).isEqualTo("반포아파트");
			assertThat(result.getBuildingDong()).isEqualTo("101");
			assertThat(result.getHo()).isNull();
		}

		@Test
		@DisplayName("동리_없는_주소_파싱_성공")
		void 동리_없는_주소_파싱_성공() {
			// given
			String address = "서울특별시 서초구 자하문로36길 16-14 반포아파트 101동 101호";

			// when
			ParsedAddress result = AddressParser.parse(address);

			// then
			assertThat(result.getSido()).isEqualTo("서울특별시");
			assertThat(result.getSigungu()).isEqualTo("서초구");
			assertThat(result.getDongRi()).isNull();
			assertThat(result.getRoadAddress()).isEqualTo("서울특별시 서초구 자하문로36길 16-14");
			assertThat(result.getRoadName()).isEqualTo("자하문로36길 16-14");
			assertThat(result.getBuildingName()).isEqualTo("반포아파트");
			assertThat(result.getBuildingDong()).isEqualTo("101");
			assertThat(result.getHo()).isEqualTo("101");
		}

		@Test
		@DisplayName("주소가_null이면_IllegalArgumentException_발생")
		void 주소가_null이면_IllegalArgumentException_발생() {
			// when & then
			assertThatThrownBy(() -> AddressParser.parse(null))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("주소가 비어있습니다");
		}

		@Test
		@DisplayName("주소가_빈_문자열이면_IllegalArgumentException_발생")
		void 주소가_빈_문자열이면_IllegalArgumentException_발생() {
			// when & then
			assertThatThrownBy(() -> AddressParser.parse("   "))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("주소가 비어있습니다");
		}

		@Test
		@DisplayName("주소_형식이_잘못되면_IllegalArgumentException_발생")
		void 주소_형식이_잘못되면_IllegalArgumentException_발생() {
			// when & then
			assertThatThrownBy(() -> AddressParser.parse("잘못된 주소 형식"))
				.isInstanceOf(IllegalArgumentException.class)
				.hasMessageContaining("주소 형식이 올바르지 않습니다");
		}

		@Test
		@DisplayName("buildingDong에서_동_제거_확인")
		void buildingDong에서_동_제거_확인() {
			// given
			String address = "서울특별시 서초구 반포동 자하문로36길 16-14 반포아파트 101동 101호";

			// when
			ParsedAddress result = AddressParser.parse(address);

			// then
			assertThat(result.getBuildingDong()).isEqualTo("101"); // "101동" -> "101"
		}

		@Test
		@DisplayName("ho에서_호_제거_확인")
		void ho에서_호_제거_확인() {
			// given
			String address = "서울특별시 서초구 반포동 자하문로36길 16-14 반포아파트 101동 101호";

			// when
			ParsedAddress result = AddressParser.parse(address);

			// then
			assertThat(result.getHo()).isEqualTo("101"); // "101호" -> "101"
		}
	}
}
