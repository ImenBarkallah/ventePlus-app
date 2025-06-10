import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule]
})
export class SidebarComponent {
  menuItems = [
    { name: 'Tableau de bord', route: '/dashboard', icon: 'dashboard' },
    { name: 'Clients', route: '/clients', icon: 'group' },
    { name: 'Produits', route: '/produits', icon: 'inventory' },
    { name: 'Catégories', route: '/categorie', icon: 'category' },
    { name: 'Devis', route: '/devis', icon: 'description' },
    { name: 'Factures', route: '/factures', icon: 'receipt' },
    { name: 'Règlements', route: '/reglements', icon: 'payment' }
  ];
 /* logout(): void {
  this.keycloakAuthService.logout();
  this.router.navigate(['/login']);
  }

  */

}


