package com.zud.backend.domain.houseprice.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@AllArgsConstructor
@Builder(toBuilder = true)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "house_official_price")
public class HouseOfficialPrice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "std_year", nullable = false)
	private Integer stdYear;

	@Column(name = "std_month", nullable = false)
	private Short stdMonth;

	@Column(name = "legal_dong_code", length = 10, nullable = false)
	private String legalDongCode;

	@Column(name = "road_address", length = 255, nullable = false)
	private String roadAddress;

	@Column(name = "sido", length = 50, nullable = false)
	private String sido;

	@Column(name = "sigungu", length = 50, nullable = false)
	private String sigungu;

	@Column(name = "eup_myeon", length = 50)
	private String eupMyeon;

	@Column(name = "dong_ri", length = 100)
	private String dongRi;

	@Column(name = "special_land_code", length = 10)
	private String specialLandCode;

	@Column(name = "lot_main_no", length = 10)
	private String lotMainNo;

	@Column(name = "lot_sub_no", length = 10)
	private String lotSubNo;

	@Column(name = "special_land_name", length = 100)
	private String specialLandName;

	@Column(name = "complex_name", length = 200)
	private String complexName;

	@Column(name = "dong_name", length = 50)
	private String dongName;

	@Column(name = "ho_name", length = 50)
	private String hoName;

	@Column(name = "exclusive_area", precision = 10, scale = 2)
	private BigDecimal exclusiveArea;

	@Column(name = "official_price", nullable = false)
	private Long officialPrice;

	@Column(name = "complex_code", length = 30)
	private String complexCode;

	@Column(name = "building_dong_code", length = 30)
	private String buildingDongCode;

	@Column(name = "unit_code", length = 30)
	private String unitCode;
}
