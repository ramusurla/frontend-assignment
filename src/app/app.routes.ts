import { Routes } from '@angular/router';

import { FigmaPage } from './pages/figma-page/figma-page';
import { ContactManagement } from './pages/contact-management/contact-management';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'figma',
    pathMatch: 'full'
  },
  {
    path: 'figma',
    component: FigmaPage
  },
  {
    path: 'contacts',
    component: ContactManagement
  }
];