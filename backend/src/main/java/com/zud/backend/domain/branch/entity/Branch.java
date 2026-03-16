package com.zud.backend.domain.branch.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.zud.backend.domain.user.entity.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@Table(name = "branches")
public class Branch {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Builder.Default
	@OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<User> users = new ArrayList<>();

	@Column(name = "name", nullable = false)
	private String name;

	@Column(name = "full_address", nullable = false)
	private String fullAddress;

	@Column(name = "longitude", nullable = false)
	private Double longitude;

	@Column(name = "latitude", nullable = false)
	private Double latitude;

}
