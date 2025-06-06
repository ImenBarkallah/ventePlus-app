package org.ms.devis_service;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class DevisServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DevisServiceApplication.class, args);
	}

}
