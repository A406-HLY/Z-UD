package com.zud.backend.domain.houseprice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zud.backend.domain.houseprice.entity.HouseTradePrice;

public interface HouseTradePriceRepository extends JpaRepository<HouseTradePrice, Long> {

	@Query("""
		SELECT h FROM HouseTradePrice h
		WHERE h.houseType = 'APARTMENT'
		AND h.sigungu = :sigungu
		AND h.roadName = :roadName
		AND (:buildingName IS NULL OR h.buildingName = :buildingName)
		AND (:buildingDong IS NULL OR h.buildingDong = :buildingDong)
		AND (:floor IS NULL OR h.floor = :floor)
		ORDER BY h.contractYearMonth DESC, h.contractDay DESC
		LIMIT 1
		""")
	HouseTradePrice findApartmentExactMatch(
		@Param("sigungu") final String sigungu,
		@Param("roadName") final String roadName,
		@Param("buildingName") final String buildingName,
		@Param("buildingDong") final String buildingDong,
		@Param("floor") final Integer floor
	);

	@Query("""
		SELECT h FROM HouseTradePrice h
		WHERE h.houseType = 'SINGLE'
		AND h.sigungu = :sigungu
		AND h.buildingName = :buildingName
		ORDER BY h.contractYearMonth DESC, h.contractDay DESC
		LIMIT 1
		""")
	HouseTradePrice findSingleHouseExactMatch(
		@Param("sigungu") final String sigungu,
		@Param("buildingName") final String buildingName
	);

	@Query("""
		SELECT h FROM HouseTradePrice h
		WHERE h.houseType = 'MULTI_HOUSEHOLD'
		AND h.sigungu = :sigungu
		AND h.roadName = :roadName
		AND (:buildingName IS NULL OR h.buildingName = :buildingName)
		AND (:floor IS NULL OR h.floor = :floor)
		ORDER BY h.contractYearMonth DESC, h.contractDay DESC
		LIMIT 1
		""")
	HouseTradePrice findMultiHouseholdExactMatch(
		@Param("sigungu") String sigungu,
		@Param("roadName") String roadName,
		@Param("buildingName") String buildingName,
		@Param("floor") Integer floor
	);

	@Query("""
		SELECT h FROM HouseTradePrice h
		WHERE h.houseType = :houseType
		AND h.sigungu = :sigungu
		AND h.roadName = :roadName
		AND h.buildingName = :buildingName
		AND (:buildingDong IS NULL OR h.buildingDong = :buildingDong)
		AND (:floor IS NULL OR h.floor = :floor)
		ORDER BY h.dealAmountManwon ASC
		LIMIT 5
		""")
	List<HouseTradePrice> findLowestPricesByBuildingDetail(
		@Param("houseType") final String houseType,
		@Param("sigungu") final String sigungu,
		@Param("roadName") final String roadName,
		@Param("buildingName") final String buildingName,
		@Param("buildingDong") final String buildingDong,
		@Param("floor") final Integer floor
	);

	@Query("""
		SELECT h FROM HouseTradePrice h
		WHERE h.houseType = :houseType
		AND h.sigungu = :sigungu
		AND h.roadName = :roadName
		AND h.buildingName = :buildingName
		ORDER BY h.dealAmountManwon ASC
		LIMIT 5
		""")
	List<HouseTradePrice> findLowestPricesByBuilding(
		@Param("houseType") final String houseType,
		@Param("sigungu") final String sigungu,
		@Param("roadName") final String roadName,
		@Param("buildingName") final String buildingName
	);
}
