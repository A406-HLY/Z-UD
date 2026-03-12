package com.zud.backend.domain.branch.repository;

public interface NearestBranchProjection {
	Integer getId();
	String getName();
	String getFullAddress();
	Double getDistanceMeter();
}