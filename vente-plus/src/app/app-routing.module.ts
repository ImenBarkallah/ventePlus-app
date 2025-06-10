import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DevisComponent } from './components/devis/devis.component';

const routes: Routes = [
  { path: 'devis', component: DevisComponent },
  { path: '', redirectTo: '/devis', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 