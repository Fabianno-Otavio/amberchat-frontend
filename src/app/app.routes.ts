import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'userSearch',
    loadComponent: () =>
      import('./pages/user-search/user-search.component').then(
        (c) => c.UserSearchComponent
      ),
  },
  {
    path: 'salesIndicators',
    loadComponent: () =>
      import('./pages/sales-indicators/sales-indicators.component').then(
        (c) => c.SalesIndicatorsComponent
      ),
  },
  {
    path: 'usersContracts',
    loadComponent: () =>
      import('./pages/users-contracts/users-contracts.component').then(
        (c) => c.UsersContractsComponent
      ),
  },
  {
    path: 'kanban',
    loadComponent: () =>
      import('./pages/kanban/kanban.component').then(
        (c) => c.KanbanComponent
      ),
  }
];
