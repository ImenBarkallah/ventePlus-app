package org.ms.facture_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;


@SpringBootApplication 
@EnableFeignClients 
public class FactureserviceApplication { 
 
   public static void main(String[] args) { 
      SpringApplication.run(FactureserviceApplication.class, args); 
   } 
 
} 