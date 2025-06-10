package org.ms.reglementservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class ReglementserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReglementserviceApplication.class, args);
    }

}

