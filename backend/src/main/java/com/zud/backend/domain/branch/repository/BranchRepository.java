package com.zud.backend.domain.branch.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zud.backend.domain.branch.entity.Branch;

public interface BranchRepository extends JpaRepository<Branch, Long> {

	@Query(value = """
		SELECT
			b.id AS id,
			b.name AS name,
			b.full_address AS fullAddress,
			ST_Distance(
				ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography,
				ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
			) AS distanceMeter
		FROM branches b
		ORDER BY ST_Distance(
			ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography,
			ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
		)
		LIMIT 1
		""", nativeQuery = true)
	Optional<NearestBranchProjection> findNearestBranch(
		@Param("longitude") Double longitude,
		@Param("latitude") Double latitude
	);

	@Query(value = """
		SELECT ST_Distance(
			ST_SetSRID(ST_MakePoint(b.longitude, b.latitude), 4326)::geography,
			ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
		)
		FROM branches b
		WHERE b.id = :branchId
		""", nativeQuery = true
	)
	Optional<Double> calculateDistanceToBranch(
		@Param("branchId") Long branchId,
		@Param("longitude") double longitude,
		@Param("latitude") double latitude
	);

}
