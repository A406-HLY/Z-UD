package com.zud.backend.domain.user.entity;

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
@Table(name = "users")
public class User extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	//TODO 지점(Branch) 연관관계 설정

	@Column(name = "name", length = 50, nullable = false)
	private String name;

	@Column(name = "employee_number", length = 100, nullable = false)
	private String employeeNumber;

	@Column(name = "password", nullable = false)
	private String password;
}

