package org.ms.produitservice.feign;

import org.ms.produitservice.model.Categorie;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name="CATEGORIE-SERVICE")
public interface CategorieServiceClient {
	@GetMapping(path = "/categories/{id}")
	Categorie findCategorieById(@PathVariable Long id);
}
