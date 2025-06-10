export interface FactureLigne {
    id: number;
    produitID: number;
    quantite: number;
    prix: number;
    remise?: number;
    tva?: number;
    produit?: any;
}