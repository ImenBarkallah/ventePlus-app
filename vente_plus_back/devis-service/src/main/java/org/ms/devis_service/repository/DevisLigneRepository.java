package org.ms.devis_service.repository;

import org.ms.devis_service.entities.DevisLigne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DevisLigneRepository extends JpaRepository<DevisLigne, Long> {}

