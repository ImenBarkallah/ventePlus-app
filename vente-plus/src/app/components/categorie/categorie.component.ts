import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Categorie } from '../../models/categorie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie.service';
import { PdfExportService } from '../../services/pdf-export.service';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrl: './categorie.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None
})
export class CategorieComponent implements OnInit {
  categories: Categorie[] = [];
  filteredCategories: Categorie[] = [];

  // Pour la recherche
  searchTerm: string = '';

  // Pour la pagination
  pageSize: number = 10;
  currentPage: number = 1;
  paginatedCategories: Categorie[] = [];
  totalPages: number = 1;

  // Enhanced Features
  sortBy: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedFilter: string = 'all';

  // Analytics
  categorieStats = {
    total: 0,
    active: 0,
    inactive: 0,
    withImages: 0
  };

  // Pour le modal (ajout/modification)
  showModal = false;
  isEditMode = false;
  modalCategorie: Partial<Categorie> = {
    nom: '',
    description: '',
    etat: true,
    imageUrl: ''
  };
  editCategorieId: number | null = null;

  // Pour l'upload d'image
  imageUrlPreview: string | null = null;
  selectedFileName: string | null = null;
  selectedFile: File | null = null;

  // Pour l'alerte
  alertMessage = '';
  alertType: 'success' | 'error' | 'delete' = 'success';
  alertTimeout: any = null;

  // Pour le modal de confirmation de suppression
  showDeleteModal = false;
  categorieToDelete: Categorie | null = null;

  // Pour le modal de détails catégorie
  showViewModal = false;
  categorieToView: Categorie | null = null;

  constructor(
    private categorieService: CategorieService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categorieService.getAll().subscribe(categories => {
      this.categories = categories;
      this.filteredCategories = categories;
      this.calculateStats();
      this.applySorting();
    });
  }

  onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCategories = this.categories;
    } else {
      this.filteredCategories = this.categories.filter(cat =>
        cat.nom.toLowerCase().includes(term) ||
        cat.description?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.applySorting();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCategories.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedCategories = this.filteredCategories.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage - 1);
  }

  openModal() {
    this.isEditMode = false;
    this.showModal = true;
    this.modalCategorie = {
      nom: '',
      description: '',
      etat: true,
      imageUrl: ''
    };
    this.imageUrlPreview = null;
    this.selectedFileName = null;
    this.selectedFile = null;
    this.editCategorieId = null;
  }

  openEditModal(cat: Categorie) {
    this.isEditMode = true;
    this.showModal = true;
    this.modalCategorie = { ...cat };
    this.imageUrlPreview = cat.imageUrl || null;
    this.editCategorieId = cat.id ?? null;
  }

  closeModal() {
    this.showModal = false;
    this.modalCategorie = {
      nom: '',
      description: '',
      etat: true,
      imageUrl: ''
    };
    this.imageUrlPreview = null;
    this.selectedFileName = null;
    this.selectedFile = null;
    this.editCategorieId = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      
      // Créer une URL pour la prévisualisation
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrlPreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage() {
    this.imageUrlPreview = null;
    this.selectedFileName = null;
    this.selectedFile = null;
    this.modalCategorie.imageUrl = '';
  }

  onModalSubmit() {
    if (!this.modalCategorie.nom?.trim()) {
      this.showAlert('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const formData = new FormData();
    
    // Créer l'objet catégorie
    const categorieData: {
      id?: number;
      nom: string;
      description: string;
      etat: boolean | undefined;
      imageUrl: string;
    } = {
      nom: this.modalCategorie.nom.trim(),
      description: this.modalCategorie.description?.trim() || '',
      etat: this.modalCategorie.etat,
      imageUrl: this.modalCategorie.imageUrl || ''
    };

    // Ajouter l'objet catégorie comme JSON string
    const categorieJson = JSON.stringify(categorieData);
    formData.append('categorie', new Blob([categorieJson], { type: 'application/json' }));

   // Ajouter l'image si elle existe
   if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  } else if (this.isEditMode && this.modalCategorie.imageUrl && !this.selectedFile && this.imageUrlPreview === null) {
      // Cas où l'image existante est supprimée
      // Envoyer un indicateur au backend pour supprimer l'image
      // Par exemple, un champ spécifique ou une valeur spéciale dans formData
      // formData.append('deleteImage', 'true');
      // Alternativement, le backend pourrait gérer cela en ne recevant pas de fichier 'image'
  }

    if (this.isEditMode && this.editCategorieId !== null) {
      // Pour la mise à jour, on envoie l'ID dans la catégorie
      categorieData.id = this.editCategorieId;
      const categorieJson = JSON.stringify(categorieData);
      formData.set('categorie', new Blob([categorieJson], { type: 'application/json' }));

      this.categorieService.update(this.editCategorieId, formData).subscribe({
        next: (cat: Categorie) => {
          const idx = this.categories.findIndex(c => c.id === this.editCategorieId);
          if (idx !== -1) {
            this.categories[idx] = { ...this.categories[idx], ...cat };
            // Mettre à jour l'URL de l'image si elle a changé
            this.categories[idx].imageUrl = cat.imageUrl;
          }
          this.showAlert('Catégorie modifiée avec succès !', 'success');
          this.closeModal();
          this.onSearchChange();
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          if (error.error) {
            console.error('Détails de l\'erreur:', error.error);
          }
          this.showAlert('Erreur lors de la modification.', 'error');
        }
      });
    } else {
      this.categorieService.create(formData).subscribe({
        next: (cat) => {
          this.categories.push(cat);
          this.showAlert('Catégorie ajoutée avec succès !', 'success');
          this.closeModal();
          this.onSearchChange();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout:', error);
          if (error.error) {
            console.error('Détails de l\'erreur:', error.error);
          }
          this.showAlert('Erreur lors de l\'ajout.', 'error');
        }
      });
    }
  }

  openDeleteModal(cat: Categorie) {
    this.categorieToDelete = cat;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.categorieToDelete = null;
  }

  confirmDelete() {
    if (!this.categorieToDelete) return;
    this.categorieService.delete(this.categorieToDelete.id ?? 0).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== this.categorieToDelete!.id);
        this.showAlert('Catégorie supprimée avec succès !', 'success');
        this.closeDeleteModal();
        this.onSearchChange();
      },
      error: () => {
        this.showAlert('Erreur lors de la suppression.', 'error');
        this.closeDeleteModal();
      }
    });
  }

  showAlert(message: string, type: 'success' | 'error' | 'delete') {
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

  // Enhanced Features
  applySorting(): void {
    this.filteredCategories.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'nom':
          valueA = a.nom?.toLowerCase() || '';
          valueB = b.nom?.toLowerCase() || '';
          break;
        case 'description':
          valueA = a.description?.toLowerCase() || '';
          valueB = b.description?.toLowerCase() || '';
          break;
        case 'etat':
          valueA = a.etat ? 1 : 0;
          valueB = b.etat ? 1 : 0;
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
    this.categorieStats.total = this.categories.length;
    this.categorieStats.active = this.categories.filter(cat => cat.etat).length;
    this.categorieStats.inactive = this.categories.filter(cat => !cat.etat).length;
    this.categorieStats.withImages = this.categories.filter(cat => cat.imageUrl && cat.imageUrl.trim() !== '').length;
  }

  // View Methods
  viewCategorie(categorie: Categorie) {
    this.categorieToView = categorie;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.categorieToView = null;
  }

  // Export Methods
  exportToPdf(): void {
    const columns = [
      { header: 'Nom', dataKey: 'nom' },
      { header: 'Description', dataKey: 'description' },
      { header: 'État', dataKey: 'etat' },
      { header: 'Image', dataKey: 'hasImage' },
      { header: 'Date de création', dataKey: 'createdAt' }
    ];

    const data = this.filteredCategories.map(categorie => ({
      nom: categorie.nom,
      description: categorie.description || 'N/A',
      etat: categorie.etat ? 'Actif' : 'Inactif',
      hasImage: categorie.imageUrl ? 'Oui' : 'Non',
      createdAt: categorie.createdAt ? new Date(categorie.createdAt).toLocaleDateString('fr-FR') : 'N/A'
    }));

    this.pdfExportService.exportTableToPdf(
      data,
      columns,
      'Liste des Catégories',
      `categories_${new Date().toISOString().split('T')[0]}.pdf`
    );
  }

  exportToExcel(): void {
    const data = this.filteredCategories.map(categorie => ({
      'Nom': categorie.nom,
      'Description': categorie.description || 'N/A',
      'État': categorie.etat ? 'Actif' : 'Inactif',
      'Image': categorie.imageUrl ? 'Oui' : 'Non',
      'Date de création': categorie.createdAt ? new Date(categorie.createdAt).toLocaleDateString('fr-FR') : 'N/A'
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
    link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }



  // Filter Methods
  applyFilter(filter: string): void {
    this.selectedFilter = filter;

    switch (filter) {
      case 'active':
        this.filteredCategories = this.categories.filter(cat => cat.etat);
        break;
      case 'inactive':
        this.filteredCategories = this.categories.filter(cat => !cat.etat);
        break;
      case 'withImages':
        this.filteredCategories = this.categories.filter(cat => cat.imageUrl && cat.imageUrl.trim() !== '');
        break;
      default:
        this.filteredCategories = this.categories;
    }

    this.currentPage = 1;
    this.applySorting();
  }

  clearFilters(): void {
    this.selectedFilter = 'all';
    this.searchTerm = '';
    this.filteredCategories = this.categories;
    this.currentPage = 1;
    this.applySorting();
  }
}