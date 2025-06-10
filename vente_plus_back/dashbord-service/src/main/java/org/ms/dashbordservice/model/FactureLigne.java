package org.ms.dashbordservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FactureLigne {
    private Long id;
    private Long produitID;
    private long quantite;
    private BigDecimal prix;
    private BigDecimal remise;
    private BigDecimal tva;
}
