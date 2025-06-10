package org.ms.reglementservice.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Reglement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String numeroReglement;
    
    private Long factureId;
    
    private Long clientId;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montantPaye;
    
    @Column(nullable = false)
    private LocalDateTime dateReglement;
    
    @Enumerated(EnumType.STRING)
    private ModeReglement modeReglement;
    
    private String reference; // Référence du chèque, virement, etc.
    
    private String commentaire;
    
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (dateReglement == null) {
            dateReglement = LocalDateTime.now();
        }
    }
}
