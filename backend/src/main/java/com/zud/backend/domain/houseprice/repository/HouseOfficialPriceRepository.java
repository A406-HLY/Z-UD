package com.zud.backend.domain.houseprice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zud.backend.domain.houseprice.entity.HouseOfficialPrice;

public interface HouseOfficialPriceRepository extends JpaRepository<HouseOfficialPrice, Long> {

	@Query("""
		SELECT h FROM HouseOfficialPrice h
		WHERE h.roadAddress = :roadAddress
		AND (:complexName IS NULL OR h.complexName = :complexName)
		AND (:dongName IS NULL OR h.dongName = :dongName)
		AND (:hoName IS NULL OR h.hoName = :hoName)
		ORDER BY h.stdYear DESC, h.stdMonth DESC
		LIMIT 1
		""")
	HouseOfficialPrice findExactMatch(
		@Param("roadAddress") final String roadAddress,
		@Param("complexName") final String complexName,
		@Param("dongName") final String dongName,
		@Param("hoName") final String hoName
	);

	@Query("""
		SELECT h FROM HouseOfficialPrice h
		WHERE h.roadAddress = :roadAddress
		AND h.complexName = :complexName
		AND (:dongName IS NULL OR h.dongName = :dongName)
		AND (:hoName IS NULL OR h.hoName = :hoName)
		ORDER BY h.officialPrice ASC
		LIMIT 5
		""")
	List<HouseOfficialPrice> findLowestPricesByBuildingDetail(
		@Param("roadAddress") final String roadAddress,
		@Param("complexName") final String complexName,
		@Param("dongName") final String dongName,
		@Param("hoName") final String hoName
	);

	@Query("""
		SELECT h FROM HouseOfficialPrice h
		WHERE h.roadAddress = :roadAddress
		AND h.complexName = :complexName
		ORDER BY h.officialPrice ASC
		LIMIT 5
		""")
	List<HouseOfficialPrice> findLowestPricesByBuilding(
		@Param("roadAddress") final String roadAddress,
		@Param("complexName") final String complexName
	);
}
