package org.ms.dashbordservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Reglement {
    private Long id;
    private String numeroReglement;
    private Long factureId;
    private Long clientId;
    private BigDecimal montantPaye;
    private LocalDateTime dateReglement;
    private String modeReglement;
    private String reference;
    private String commentaire;
}
