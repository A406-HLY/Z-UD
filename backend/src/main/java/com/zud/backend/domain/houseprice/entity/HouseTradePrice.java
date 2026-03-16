package com.zud.backend.domain.houseprice.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.zud.backend.common.entity.BaseEntity;

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
@Table(name = "house_trade_price")
public class HouseTradePrice extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "house_type", length = 30, nullable = false)
	private String houseType;

	@Column(name = "sigungu", length = 200, nullable = false)
	private String sigungu;

	@Column(name = "jibun", length = 100, nullable = false)
	private String jibun;

	@Column(name = "lot_main_no", length = 10)
	private String lotMainNo;

	@Column(name = "lot_sub_no", length = 10)
	private String lotSubNo;

	@Column(name = "building_name", length = 255)
	private String buildingName;

	@Column(name = "building_dong", length = 50)
	private String buildingDong;

	@Column(name = "floor")
	private Integer floor;

	@Column(name = "exclusive_area", precision = 12, scale = 4)
	private BigDecimal exclusiveArea;

	@Column(name = "land_right_area", precision = 12, scale = 4)
	private BigDecimal landRightArea;

	@Column(name = "total_floor_area", precision = 12, scale = 4)
	private BigDecimal totalFloorArea;

	@Column(name = "land_area", precision = 12, scale = 4)
	private BigDecimal landArea;

	@Column(name = "road_condition", length = 100)
	private String roadCondition;

	@Column(name = "contract_year_month", nullable = false)
	private Integer contractYearMonth;

	@Column(name = "contract_day", nullable = false)
	private Short contractDay;

	@Column(name = "deal_amount_manwon", nullable = false)
	private Long dealAmountManwon;

	@Column(name = "buyer_type", length = 100)
	private String buyerType;

	@Column(name = "seller_type", length = 100)
	private String sellerType;

	@Column(name = "build_year")
	private Integer buildYear;

	@Column(name = "road_name", length = 255)
	private String roadName;

	@Column(name = "cancel_date")
	private LocalDate cancelDate;

	@Column(name = "deal_type", length = 50)
	private String dealType;

	@Column(name = "broker_location", length = 255)
	private String brokerLocation;

	@Column(name = "registry_date")
	private LocalDate registryDate;
}
