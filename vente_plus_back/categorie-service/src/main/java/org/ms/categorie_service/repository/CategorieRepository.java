package org.ms.categorie_service.repository; 
 
import org.ms.categorie_service.entities.Categorie;
import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.data.rest.webmvc.RepositoryRestController; 
@RepositoryRestController 
public interface CategorieRepository extends JpaRepository<Categorie,Long> {} 