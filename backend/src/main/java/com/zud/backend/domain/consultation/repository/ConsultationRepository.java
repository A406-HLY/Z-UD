package com.zud.backend.domain.consultation.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zud.backend.domain.consultation.entity.Consultation;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
	Optional<Consultation> findByExternalConsultationUuid(String externalConsultationUuid);
}