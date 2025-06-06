package org.ms.facture_service.repository;

import org.ms.facture_service.entities.FactureLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FactureLigneRepository extends JpaRepository<FactureLigne, Long> {
	List<FactureLigne> findByFactureId(Long factureId);
}
