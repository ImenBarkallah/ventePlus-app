package org.ms.categorie_service.services;
import org.ms.categorie_service.entities.Categorie;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategorieService {
    Categorie saveCategorie(Categorie categorie, MultipartFile image);
    Categorie getCategorieById(Long id);
    List<Categorie> getAllCategories();
    Categorie updateCategorie(Long id, Categorie updatedCategorie, MultipartFile image);
    void deleteCategorie(Long id);
}
