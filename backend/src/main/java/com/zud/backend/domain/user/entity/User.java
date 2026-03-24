package com.zud.backend.domain.user.entity;

import java.util.ArrayList;
import java.util.List;

import com.zud.backend.common.entity.BaseEntity;
import com.zud.backend.domain.branch.entity.Branch;
import com.zud.backend.domain.consultation.entity.Consultation;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "users")
public class User extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "branch_id", nullable = false)
	private Branch branch;

	@Builder.Default
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	List<Consultation> consultations = new ArrayList<>();

	@Column(name = "employee_number", unique = true, length = 100, nullable = false)
	private String employeeNumber;

	@Column(name = "name", length = 50, nullable = false)
	private String name;

	@Column(name = "password", nullable = false)
	private String password;
}

