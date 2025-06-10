export interface Client {
    id?: number;  // Optional for creation, required after saving
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    codeClient: string;
    adresse: string;
    createdAt?: Date;
}