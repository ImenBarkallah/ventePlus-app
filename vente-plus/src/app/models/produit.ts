import { Categorie } from "./categorie";

export interface Produit {
    id?: number;
    nom: string;
    prix: number;
    quantite: number;
    reference: string;
    imageUrl?: string;
    createdAt?: Date;
    categorieId?: number;
    categorie?: Categorie;
}