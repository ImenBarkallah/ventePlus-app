package org.ms.categorie_service.services;

import org.ms.categorie_service.entities.Categorie;
import org.ms.categorie_service.repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class CategorieServiceImpl implements CategorieService {

        private final CategorieRepository categorieRepository;
        private final CloudinaryService cloudinaryService;


public CategorieServiceImpl(CategorieRepository categorieRepository,CloudinaryService cloudinaryService){
     this.categorieRepository = categorieRepository;
     this.cloudinaryService=cloudinaryService;

}

@Override
public Categorie saveCategorie(Categorie categorie, MultipartFile image) {
    if (image != null && !image.isEmpty()) {
        try {
            // Upload image to Cloudinary and get URL
            String imageUrl = cloudinaryService.uploadImage(image);
            categorie.setImageUrl(imageUrl);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l’upload de l’image", e);
        }
    }

    return categorieRepository.save(categorie);
}


    @Override
    public Categorie getCategorieById(Long id) {
        return categorieRepository.findById(id).orElse(null);
    }

    @Override
    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

 @Override
public Categorie updateCategorie(Long id, Categorie updatedCategorie, MultipartFile image) {
    Optional<Categorie> optional = categorieRepository.findById(id);
    if (optional.isPresent()) {
        Categorie existingCategorie = optional.get();

        // Mise à jour des champs texte
        existingCategorie.setNom(updatedCategorie.getNom());
        existingCategorie.setDescription(updatedCategorie.getDescription());
        existingCategorie.setEtat(updatedCategorie.getEtat());

        // Mise à jour de l'image si fournie
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = cloudinaryService.uploadImage(image);
                existingCategorie.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de l’upload de l’image", e);
            }
        }

        return categorieRepository.save(existingCategorie);
    } else {
        throw new RuntimeException("Catégorie avec ID " + id + " non trouvée");
    }
}


    @Override
    public void deleteCategorie(Long id) {
        categorieRepository.deleteById(id);
    }
}