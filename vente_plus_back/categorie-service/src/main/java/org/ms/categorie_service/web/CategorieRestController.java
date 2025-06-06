package org.ms.categorie_service.web;

import java.util.List;

import org.ms.categorie_service.entities.Categorie;
import org.ms.categorie_service.services.CategorieService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RefreshScope
@RequestMapping("/categories")

public class CategorieRestController {

	@Autowired
	private CategorieService categorieService;

	@Value("${app.message}")
	private String message;

	@GetMapping("/message")
	public String getMessage() {
		return message;
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Categorie save(@RequestPart("categorie")  Categorie categorie, @RequestPart(value = "image", required = false) MultipartFile image) {
		return categorieService.saveCategorie(categorie,image);
	}

	@GetMapping("/{id}")
	public Categorie getById(@PathVariable Long id) {
		return categorieService.getCategorieById(id);
	}

	@GetMapping
	public List<Categorie> getAll() {
		return categorieService.getAllCategories();
	}

	@PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Categorie update(@PathVariable Long id, @RequestPart Categorie categorie,@RequestPart (value = "image", required = false) MultipartFile image) {
		try{
		return categorieService.updateCategorie(id, categorie,image);
		  } catch (Exception e) {
            return null;  
        }
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		categorieService.deleteCategorie(id);
	}

}
