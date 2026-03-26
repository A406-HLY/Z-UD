package com.zud.backend.domain.consultation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zud.backend.domain.consultation.entity.ConsultationTransfer;

public interface ConsultationTransferRepository extends JpaRepository<ConsultationTransfer, String> {
}

