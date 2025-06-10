import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit.service';
import { Produit } from '../../models/produit';
import { CategorieService } from '../../services/categorie.service';
import { Categorie } from '../../models/categorie';
import { PdfExportService } from '../../services/pdf-export.service';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrl: './produit.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None
})
export class ProduitComponent implements OnInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  paginatedProduits: Produit[] = [];
  categories: Categorie[] = [];

  // Recherche & pagination
  searchTerm: string = '';
  pageSize: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;

  // Enhanced Features
  sortBy: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedFilter: string = 'all';
  selectedCategory: string = 'all';

  // Analytics
  produitStats = {
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  };

  // Modal ajout/modif
  showModal = false;
  isEditMode = false;
  modalProduit: Partial<Produit> = {};
  editProduitId: number | null = null;

  // Modal suppression
  showDeleteModal = false;
  produitToDelete: Produit | null = null;

  // Pour le modal de détails produit
  showViewModal = false;
  produitToView: Produit | null = null;

  // Alertes
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';
  alertTimeout: any = null;

  selectedFile: File | null = null;
  selectedFileName: string = '';
  imageUrlPreview: string | ArrayBuffer | null = null;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit() {
    this.loadProduits();
    this.categorieService.getAll().subscribe(cats => this.categories = cats);
  }

  loadProduits() {
    this.produitService.getAllProduits().subscribe(produits => {
      this.produits = produits;
      this.filteredProduits = produits;
      this.currentPage = 1;
      this.calculateStats();
      this.applySorting();
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredProduits.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProduits = this.filteredProduits.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }
  nextPage() { this.goToPage(this.currentPage + 1); }
  prevPage() { this.goToPage(this.currentPage - 1); }

  // Modal ajout/modif
  openModal() {
    this.isEditMode = false;
    this.showModal = true;
    this.modalProduit = { 
      nom: '', 
      prix: undefined, 
      quantite: undefined,
      categorieId: undefined,
      reference: '' 
    };
    this.editProduitId = null;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.imageUrlPreview = null;
  }
  openEditModal(prod: Produit) {
    this.isEditMode = true;
    this.showModal = true;
    this.modalProduit = { ...prod, categorieId: prod.categorieId ?? prod.categorie?.id };
    this.editProduitId = prod.id ?? null;
    this.selectedFile = null;
    this.selectedFileName = '';
    if (prod.imageUrl) {
      this.imageUrlPreview = prod.imageUrl;
    } else {
      this.imageUrlPreview = null;
    }
  }
  closeModal() {
    this.showModal = false;
    this.modalProduit = {};
    this.editProduitId = null;
    this.selectedFile = null;
    this.selectedFileName = '';
    this.imageUrlPreview = null;
  }
  onModalSubmit() {
    // Vérification de tous les champs requis (sans l'image qui est optionnelle)
    if (!this.modalProduit.nom?.trim()) {
      this.showAlert('Le nom du produit est obligatoire', 'error');
      return;
    }

    if (!this.modalProduit.reference?.trim()) {
      this.showAlert('La référence du produit est obligatoire', 'error');
      return;
    }

    if (!this.modalProduit.prix || this.modalProduit.prix <= 0) {
      this.showAlert('Le prix doit être supérieur à 0', 'error');
      return;
    }

    if (this.modalProduit.quantite === undefined || this.modalProduit.quantite === null || this.modalProduit.quantite < 0) {
      this.showAlert('La quantité ne peut pas être négative', 'error');
      return;
    }

    if (!this.modalProduit.categorieId) {
      this.showAlert('Veuillez sélectionner une catégorie', 'error');
      return;
    }

    const formData = new FormData();
    // Ajouter le produit comme JSON string
    const produitJson = JSON.stringify(this.modalProduit);
    formData.append('produit', new Blob([produitJson], { type: 'application/json' }));

    // Ajouter l'image si elle existe
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.isEditMode && this.modalProduit.imageUrl && !this.selectedFile && this.imageUrlPreview === null) {
        // Cas où l'image existante est supprimée
        // Envoyer un indicateur au backend pour supprimer l'image
        // Par exemple, un champ spécifique ou une valeur spéciale dans formData
        // formData.append('deleteImage', 'true');
        // Alternativement, le backend pourrait gérer cela en ne recevant pas de fichier 'image'
    }

    if (this.isEditMode && this.editProduitId !== null) {
      // Pour la mise à jour, on envoie l'ID dans le produit
      this.modalProduit.id = this.editProduitId;
      const produitJson = JSON.stringify(this.modalProduit);
      formData.set('produit', new Blob([produitJson], { type: 'application/json' }));

      this.produitService.updateProduitWithImage(this.editProduitId, formData).subscribe({
        next: (prod: Produit) => {
          const idx = this.produits.findIndex(p => p.id === this.editProduitId);
          if (idx !== -1) {
            this.produits[idx] = { ...this.produits[idx], ...prod };
            // Mettre à jour l'URL de l'image si elle a changé ou si elle a été supprimée
            this.produits[idx].imageUrl = prod.imageUrl;
          }
          this.showAlert('Produit modifié avec succès !', 'success');
          this.closeModal();
          this.onSearchChange();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.showAlert('Erreur lors de la modification.', 'error');
        }
      });
    } else {
      this.produitService.saveProduitWithImage(formData).subscribe({
        next: (prod: Produit) => {
          this.produits.push(prod);
          this.showAlert('Produit ajouté avec succès !', 'success');
          this.closeModal();
          this.onSearchChange();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout:', error);
          this.showAlert('Erreur lors de l\'ajout.', 'error');
        }
      });
    }
  }

  // Modal suppression
  openDeleteModal(prod: Produit) {
    this.produitToDelete = prod;
    this.showDeleteModal = true;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.produitToDelete = null;
  }
  confirmDelete() {
    if (!this.produitToDelete) return;
    this.produitService.deleteProduit(this.produitToDelete.id ?? 0).subscribe({
      next: () => {
        this.produits = this.produits.filter(p => p.id !== this.produitToDelete!.id);
        this.showAlert('Produit supprimé avec succès !', 'success');
        this.closeDeleteModal();
        this.onSearchChange();
      },
      error: () => {
        this.showAlert('Erreur lors de la suppression.', 'error');
        this.closeDeleteModal();
      }
    });
  }

  // Alertes
  showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
    this.alertTimeout = setTimeout(() => this.closeAlert(), 3000);
  }
  closeAlert() {
    this.alertMessage = '';
    this.alertType = 'success';
    if (this.alertTimeout) clearTimeout(this.alertTimeout);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrlPreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.imageUrlPreview = null; // Réinitialiser la prévisualisation
    }
  }

  // Nouvelle méthode pour supprimer l'image sélectionnée ou existante
  removeImage(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.imageUrlPreview = null;
    // Vous pourriez aussi vouloir marquer le produit comme n'ayant plus d'image si c'est un produit existant
    // this.modalProduit.imageUrl = undefined;
  }

  // ==================== STOCK STATUS METHODS ====================

  getStockStatusClass(quantite: number): string {
    if (quantite === 0) {
      return 'stock-out';
    } else if (quantite <= 5) {
      return 'stock-low';
    } else if (quantite <= 20) {
      return 'stock-medium';
    } else {
      return 'stock-good';
    }
  }

  getStockStatusText(quantite: number): string {
    if (quantite === 0) {
      return 'Rupture';
    } else if (quantite <= 5) {
      return 'Stock faible';
    } else if (quantite <= 20) {
      return 'Stock moyen';
    } else {
      return 'En stock';
    }
  }

  getStockIconClass(quantite: number): string {
    if (quantite === 0) {
      return 'fas fa-exclamation-triangle';
    } else if (quantite <= 5) {
      return 'fas fa-exclamation-circle';
    } else if (quantite <= 20) {
      return 'fas fa-info-circle';
    } else {
      return 'fas fa-check-circle';
    }
  }

  // Enhanced Features
  applySorting(): void {
    this.filteredProduits.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'nom':
          valueA = a.nom?.toLowerCase() || '';
          valueB = b.nom?.toLowerCase() || '';
          break;
        case 'reference':
          valueA = a.reference?.toLowerCase() || '';
          valueB = b.reference?.toLowerCase() || '';
          break;
        case 'prix':
          valueA = a.prix || 0;
          valueB = b.prix || 0;
          break;
        case 'quantite':
          valueA = a.quantite || 0;
          valueB = b.quantite || 0;
          break;
        case 'categorie':
          valueA = a.categorie?.nom?.toLowerCase() || '';
          valueB = b.categorie?.nom?.toLowerCase() || '';
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt || '').getTime();
          valueB = new Date(b.createdAt || '').getTime();
          break;
        default:
          valueA = a.nom?.toLowerCase() || '';
          valueB = b.nom?.toLowerCase() || '';
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.updatePagination();
  }

  toggleSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  // Analytics Methods
  calculateStats(): void {
    this.produitStats.total = this.produits.length;
    this.produitStats.inStock = this.produits.filter(p => (p.quantite || 0) > 5).length;
    this.produitStats.lowStock = this.produits.filter(p => (p.quantite || 0) > 0 && (p.quantite || 0) <= 5).length;
    this.produitStats.outOfStock = this.produits.filter(p => (p.quantite || 0) === 0).length;
    this.produitStats.totalValue = this.produits.reduce((sum, p) => sum + ((p.prix || 0) * (p.quantite || 0)), 0);
  }

  // View Methods
  viewProduit(produit: Produit) {
    this.produitToView = produit;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.produitToView = null;
  }

  // Export Methods
  exportToPdf(): void {
    const columns = [
      { header: 'Nom', dataKey: 'nom' },
      { header: 'Référence', dataKey: 'reference' },
      { header: 'Catégorie', dataKey: 'categorie' },
      { header: 'Prix', dataKey: 'prix' },
      { header: 'Quantité', dataKey: 'quantite' },
      { header: 'Statut Stock', dataKey: 'stockStatus' },
      { header: 'Date de création', dataKey: 'createdAt' }
    ];

    const data = this.filteredProduits.map(produit => ({
      nom: produit.nom,
      reference: produit.reference || 'N/A',
      categorie: produit.categorie?.nom || 'N/A',
      prix: produit.prix ? `${produit.prix.toFixed(2)} Dt` : 'N/A',
      quantite: produit.quantite?.toString() || '0',
      stockStatus: this.getStockStatusText(produit.quantite || 0),
      createdAt: produit.createdAt ? new Date(produit.createdAt).toLocaleDateString('fr-FR') : 'N/A'
    }));

    this.pdfExportService.exportTableToPdf(
      data,
      columns,
      'Liste des Produits',
      `produits_${new Date().toISOString().split('T')[0]}.pdf`
    );
  }

  exportToExcel(): void {
    const data = this.filteredProduits.map(produit => ({
      'Nom': produit.nom,
      'Référence': produit.reference || 'N/A',
      'Catégorie': produit.categorie?.nom || 'N/A',
      'Prix': produit.prix ? `${produit.prix.toFixed(2)} Dt` : 'N/A',
      'Quantité': produit.quantite?.toString() || '0',
      'Statut Stock': this.getStockStatusText(produit.quantite || 0),
      'Date de création': produit.createdAt ? new Date(produit.createdAt).toLocaleDateString('fr-FR') : 'N/A'
    }));

    // Convert to CSV
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `produits_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filter Methods
  applyFilters(): void {
    let filtered = this.produits;

    // Apply search filter
    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(p =>
        p.nom.toLowerCase().includes(term) ||
        p.reference?.toLowerCase().includes(term) ||
        (p.categorie?.nom?.toLowerCase().includes(term) ?? false) ||
        (p.prix !== null && p.prix !== undefined ? p.prix.toString().includes(term) : false) ||
        (p.quantite !== null && p.quantite !== undefined ? p.quantite.toString().includes(term) : false)
      );
    }

    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categorieId?.toString() === this.selectedCategory);
    }

    // Apply stock status filter
    switch (this.selectedFilter) {
      case 'inStock':
        filtered = filtered.filter(p => (p.quantite || 0) > 5);
        break;
      case 'lowStock':
        filtered = filtered.filter(p => (p.quantite || 0) > 0 && (p.quantite || 0) <= 5);
        break;
      case 'outOfStock':
        filtered = filtered.filter(p => (p.quantite || 0) === 0);
        break;
    }

    this.filteredProduits = filtered;
    this.currentPage = 1;
    this.applySorting();
  }

  applyStockFilter(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  applyCategoryFilter(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedFilter = 'all';
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.filteredProduits = this.produits;
    this.currentPage = 1;
    this.applySorting();
  }
}
