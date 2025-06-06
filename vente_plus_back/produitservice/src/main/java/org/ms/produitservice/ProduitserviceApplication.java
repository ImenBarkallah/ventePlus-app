package org.ms.produitservice;

import org.springframework.boot.SpringApplication; 
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ProduitserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProduitserviceApplication.class, args);
    }

}

