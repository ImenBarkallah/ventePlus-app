package org.ms.produitservice.web;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Hashtable;
import java.util.List;
import java.util.Map;

import org.ms.produitservice.entities.Produit;
import org.ms.produitservice.services.ProduitService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.MediaType;

@RestController
@RefreshScope
@RequestMapping("/produits")

public class ProduitRestController {

	   private final ProduitService produitService;

	    // Constructeur explicite
	    public ProduitRestController(ProduitService produitService) {
	        this.produitService = produitService;
	    }
	    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	    public Produit saveProduit(@RequestPart("produit") Produit produit,
	                               @RequestPart(value = "image", required = false) MultipartFile image) {
	        return produitService.saveProduitWithImage(produit, image);
	    }

	    /*
	         @PostMapping
    public Produit saveProduit(@RequestBody Produit produit) {
        return produitService.saveProduit(produit);
    }
	     */

    @GetMapping("/{id}")
    public Produit getProduit(@PathVariable Long id) {
        return produitService.getProduitWithCategorie(id);
    }

    @GetMapping
    public List<Produit> getAllProduits() {
        return produitService.getAllProduits();
    }

    
   /* @PutMapping("/{id}")
    public Produit updateProduit(@PathVariable Long id, @RequestBody Produit produit) {
        return produitService.updateProduit(id, produit);
    }
    
    */
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Produit updateProduitWithImage(
        @PathVariable Long id,
        @RequestPart("produit") Produit produit,
        @RequestPart(value = "image", required = false) MultipartFile image) {

        try {
            return produitService.updateProduitWithImage(id, produit, image);
        } catch (Exception e) {
            return null;  
        }
    }


    
    @DeleteMapping("/{id}")
    public void deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
    }

	@Value("${globalParam}")
	private int globalParam;
	@Value("${monParam}")
	private int monParam;
	@Value("${email}")
	private String email;

	@GetMapping("config")
	public Map<String, Object> config() {
		Map<String, Object> params = new Hashtable<>();
		params.put("globalParam", globalParam);
		params.put("monParam", monParam);
		params.put("email", email);
		params.put("threadName", Thread.currentThread().toString());
		return params;
	}

}
