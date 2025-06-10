import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../models/client';
import { ClientService } from '../../services/client.service';
import { PdfExportService } from '../../services/pdf-export.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];

  // Pour la recherche
  searchTerm: string = '';

  // Pour la pagination
  pageSize: number = 10;
  currentPage: number = 1;
  paginatedClients: Client[] = [];
  totalPages: number = 1;

  // Enhanced Features
  sortBy: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedFilter: string = 'all';

  // Analytics
  clientStats = {
    total: 0,
    newThisMonth: 0,
    activeClients: 0,
    averageOrderValue: 0
  };

  // Pour le modal (ajout/modification)
  showModal = false;
  isEditMode = false;
  modalClient: Client = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    codeClient: '',
    adresse: ''
  };
  editClientId: number | null = null;

  // Pour l'alerte
  alertMessage = '';
  alertType: 'success' | 'error' | 'delete' = 'success';
  alertTimeout: any = null;

  // Pour le modal de confirmation de suppression
  showDeleteModal = false;
  clientToDelete: Client | null = null;

  // Pour le modal de détails client
  showViewModal = false;
  clientToView: Client | null = null;

  constructor(
    private clientService: ClientService,
    private pdfExportService: PdfExportService
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getAllClients().subscribe(clients => {
      this.clients = clients;
      this.filteredClients = clients;
      this.calculateStats();
      this.applySorting();
    });
  }

  onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredClients = this.clients;
    } else {
      this.filteredClients = this.clients.filter(client =>
        client.nom.toLowerCase().includes(term) ||
        client.prenom.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.codeClient?.toLowerCase().includes(term) ||
        client.adresse?.toLowerCase().includes(term) ||
        client.telephone?.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.applySorting();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredClients.length / this.pageSize) || 1;
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedClients = this.filteredClients.slice(start, end);
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
    this.modalClient = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      codeClient: '',
      adresse: ''
    };
    this.editClientId = null;
  }

  openEditModal(client: Client) {
    this.isEditMode = true;
    this.showModal = true;
    this.modalClient = { ...client };
    this.editClientId = client.id ?? null;
  }

  closeModal() {
    this.showModal = false;
    this.modalClient = {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      codeClient: '',
      adresse: ''
    };
    this.editClientId = null;
  }

  onModalSubmit() {
    // Validation
    if (!this.modalClient.nom.trim()) {
      this.showAlert('Le nom est obligatoire', 'error');
      return;
    }

    if (!this.modalClient.prenom.trim()) {
      this.showAlert('Le prénom est obligatoire', 'error');
      return;
    }

    if (!this.modalClient.email.trim()) {
      this.showAlert('L\'email est obligatoire', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.modalClient.email)) {
      this.showAlert('Veuillez saisir un email valide', 'error');
      return;
    }

    // Phone validation (if provided)
    if (this.modalClient.telephone && this.modalClient.telephone.trim()) {
      const phoneRegex = /^[0-9+\-\s()]{8,}$/;
      if (!phoneRegex.test(this.modalClient.telephone.trim())) {
        this.showAlert('Veuillez saisir un numéro de téléphone valide', 'error');
        return;
      }
    }

    if (this.isEditMode && this.editClientId !== null) {
      // Modification
      this.clientService.updateClient(this.editClientId, this.modalClient).subscribe({
        next: (client) => {
          const idx = this.clients.findIndex(c => c.id === this.editClientId);
          if (idx !== -1) this.clients[idx] = client;
          this.showAlert('Client modifié avec succès !', 'success');
          this.closeModal();
          this.onSearchChange();
        },
        error: () => this.showAlert('Erreur lors de la modification.', 'error')
      });
    } else {
      // Ajout
      this.clientService.saveClient(this.modalClient).subscribe({
        next: (client) => {
          this.clients.push(client);
          this.showAlert('Client ajouté avec succès !', 'success');
          this.closeModal();
          this.onSearchChange();
        },
        error: () => this.showAlert('Erreur lors de l\'ajout.', 'error')
      });
    }
  }

  openDeleteModal(client: Client) {
    this.clientToDelete = client;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.clientToDelete = null;
  }

  viewClient(client: Client) {
    this.clientToView = client;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.clientToView = null;
  }

  confirmDelete() {
    if (!this.clientToDelete?.id) return;
    this.clientService.deleteClient(this.clientToDelete.id).subscribe({
      next: () => {
        this.clients = this.clients.filter(c => c.id !== this.clientToDelete!.id);
        this.showAlert('Client supprimé avec succès !', 'success');
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
    this.filteredClients.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'nom':
          valueA = a.nom?.toLowerCase() || '';
          valueB = b.nom?.toLowerCase() || '';
          break;
        case 'prenom':
          valueA = a.prenom?.toLowerCase() || '';
          valueB = b.prenom?.toLowerCase() || '';
          break;
        case 'email':
          valueA = a.email?.toLowerCase() || '';
          valueB = b.email?.toLowerCase() || '';
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
    this.clientStats.total = this.clients.length;

    // Calculate new clients this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    this.clientStats.newThisMonth = this.clients.filter(client => {
      const clientDate = new Date(client.createdAt || '');
      return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
    }).length;

    // For demo purposes - in real app, you'd get this from analytics service
    this.clientStats.activeClients = Math.floor(this.clients.length * 0.8);
    this.clientStats.averageOrderValue = 1250.50;
  }

  // Export Methods
  exportToPdf(): void {
    const columns = [
      { header: 'Code Client', dataKey: 'codeClient' },
      { header: 'Nom', dataKey: 'nom' },
      { header: 'Prénom', dataKey: 'prenom' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Téléphone', dataKey: 'telephone' },
      { header: 'Adresse', dataKey: 'adresse' },
      { header: 'Date de création', dataKey: 'createdAt' }
    ];

    const data = this.filteredClients.map(client => ({
      codeClient: client.codeClient || 'N/A',
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone || 'N/A',
      adresse: client.adresse || 'N/A',
      createdAt: client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR') : 'N/A'
    }));

    this.pdfExportService.exportTableToPdf(
      data,
      columns,
      'Liste des Clients',
      `clients_${new Date().toISOString().split('T')[0]}.pdf`
    );
  }

  exportToExcel(): void {
    const data = this.filteredClients.map(client => ({
      'Code Client': client.codeClient || 'N/A',
      'Nom': client.nom,
      'Prénom': client.prenom,
      'Email': client.email,
      'Téléphone': client.telephone || 'N/A',
      'Adresse': client.adresse || 'N/A',
      'Date de création': client.createdAt ? new Date(client.createdAt).toLocaleDateString('fr-FR') : 'N/A'
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
    link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }



  // Filter Methods
  applyFilter(filter: string): void {
    this.selectedFilter = filter;

    switch (filter) {
      case 'recent':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        this.filteredClients = this.clients.filter(client =>
          new Date(client.createdAt || '') > oneMonthAgo
        );
        break;
      case 'active':
        // For demo - in real app, you'd have activity data
        this.filteredClients = this.clients.filter((_, index) => index % 2 === 0);
        break;
      default:
        this.filteredClients = this.clients;
    }

    this.currentPage = 1;
    this.applySorting();
  }

  clearFilters(): void {
    this.selectedFilter = 'all';
    this.searchTerm = '';
    this.filteredClients = this.clients;
    this.currentPage = 1;
    this.applySorting();
  }
}
