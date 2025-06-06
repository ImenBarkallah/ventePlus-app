package org.ms.produitservice.repository; 
 
import java.util.List;

import org.ms.produitservice.entities.Produit; 
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.stereotype.Repository; 
@Repository
public interface ProduitRepository extends JpaRepository<Produit,Long> {
	List<Produit> findAllByOrderByCreatedAtDesc();

} 