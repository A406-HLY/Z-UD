package com.zud.backend.domain.branch.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zud.backend.domain.branch.entity.Branch;

public interface BranchRepository extends JpaRepository<Branch, Integer> {

	@Query(value = """
		SELECT
			b.id AS id,
			b.branch_name AS name,
			b.full_address AS fullAddress,
			ST_Distance(
				b.location,
				ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
			) AS distanceMeter
		FROM branch b
		ORDER BY b.location <-> ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
		LIMIT 1
		""", nativeQuery = true)
	Optional<NearestBranchProjection> findNearestBranch(
		@Param("longitude") Double longitude,
		@Param("latitude") Double latitude
	);

	@Query(value = """
		SELECT ST_Distance(
			b.location,
			ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
		)
		FROM branch b
		WHERE b.id = :branchId
		""", nativeQuery = true
	)
	Optional<Double> calculateDistanceToBranch(
		@Param("branchId") Long branchId,
		@Param("longitude") double longitude,
		@Param("latitude") double latitude
	);

}
