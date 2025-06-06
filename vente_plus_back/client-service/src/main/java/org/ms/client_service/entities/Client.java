package org.ms.client_service.entities;

import lombok.AllArgsConstructor; 
import lombok.Data; 
import lombok.NoArgsConstructor; 
import lombok.ToString;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity; 
import jakarta.persistence.GeneratedValue; 
import jakarta.persistence.GenerationType; 
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType; 
 
 
@Entity 
@Data  
@NoArgsConstructor  
@AllArgsConstructor  
@ToString 
public class Client { 
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id; 
    private String nom; 
    private String prenom;
    private String email;   
    private String telephone;
    @Column(unique = true, nullable = false)
    private String codeClient;
    private String adresse;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

}
