package org.ms.reglementservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Client {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String codeClient;
    private String adresse;
}
