import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CategorieComponent } from './components/categorie/categorie.component';
import { LayoutComponent } from './components/layout/layout.component';
import { ProduitComponent } from './components/produit/produit.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DevisComponent } from './components/devis/devis.component';
import { ClientsComponent } from './components/clients/clients.component';
import { FactureComponent } from './components/facture/facture.component';
import { ReglementComponent } from './components/reglement/reglement.component';
//import { ReglementComponent } from './components/reglement/reglement.component';
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'categorie', component: CategorieComponent },
      { path: 'produits', component: ProduitComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'devis', component: DevisComponent },
      { path: 'factures', component: FactureComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'reglements', component: ReglementComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];