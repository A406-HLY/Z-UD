package com.zud.backend.domain.consultation.entity;

import com.zud.backend.common.converter.ResidentRegistrationNumberEncryptConverter;
import com.zud.backend.domain.consultation.enums.EmploymentType;
import com.zud.backend.domain.consultation.enums.LoanPurpose;
import com.zud.backend.domain.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "consultations")
public class Consultation {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Convert(converter = ResidentRegistrationNumberEncryptConverter.class)
	@Column(name = "resident_registration_number")
	private String residentRegistrationNumber;

	@Column(name = "name")
	private String name;

	@Column(name = "phone_number")
	private String phoneNumber;

	@Column(name = "employment_type")
	@Enumerated(value = EnumType.STRING)
	private EmploymentType employmentType;

	@Column(name = "target_loan_amount")
	private Long targetLoanAmount;

	@Column(name = "loan_purpose")
	@Enumerated(value = EnumType.STRING)
	private LoanPurpose loanPurpose;

	@Column(name = "owned_house_count")
	private Integer ownedHouseCount;

	public static Consultation create(
		final User user,
		final String name,
		final String phoneNumber,
		final String residentRegistrationNumber,
		final EmploymentType employmentType,
		final Long targetLoanAmount,
		final LoanPurpose loanPurpose,
		final Integer ownedHouseCount
	) {
		return Consultation.builder()
			.user(user)
			.name(name)
			.phoneNumber(phoneNumber)
			.residentRegistrationNumber(residentRegistrationNumber)
			.employmentType(employmentType)
			.targetLoanAmount(targetLoanAmount)
			.loanPurpose(loanPurpose)
			.ownedHouseCount(ownedHouseCount)
			.build();
	}
}
