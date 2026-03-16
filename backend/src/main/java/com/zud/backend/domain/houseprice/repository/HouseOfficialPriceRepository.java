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
		@Param("roadAddress") String roadAddress,
		@Param("complexName") String complexName,
		@Param("dongName") String dongName,
		@Param("hoName") String hoName
	);

	@Query("""
		SELECT h FROM HouseOfficialPrice h
		WHERE h.sido = :sido
		AND h.sigungu = :sigungu
		AND (:dongRi IS NULL OR h.dongRi = :dongRi)
		ORDER BY h.officialPrice ASC
		LIMIT 5
		""")
	List<HouseOfficialPrice> findLowestPricesInDong(
		@Param("sido") String sido,
		@Param("sigungu") String sigungu,
		@Param("dongRi") String dongRi
	);
}
