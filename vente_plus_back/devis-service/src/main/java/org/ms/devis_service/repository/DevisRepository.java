package org.ms.devis_service.repository;

import java.util.List;

import org.ms.devis_service.entities.Devis;
import org.ms.devis_service.entities.StatutDevis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DevisRepository extends JpaRepository<Devis, Long> {
	List<Devis> findByClientId(Long clientId);
    List<Devis> findByStatut(StatutDevis statut);
}