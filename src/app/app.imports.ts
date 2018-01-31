import { RouterModule, PreloadAllModules } from '@angular/router';

import { ContextMenuModule } from 'angular2-contextmenu';
import { DropdownModule } from 'ng2-bootstrap/components/dropdown';
import { TooltipModule } from 'ng2-bootstrap/components/tooltip';
import { ModalModule } from 'ngx-modal';
import { Ng2PaginationModule } from 'ng2-pagination';

import { routes } from './app.routing';

export const APP_IMPORTS = [
	ContextMenuModule,
	DropdownModule,
	TooltipModule,
	ModalModule,
	Ng2PaginationModule,
	RouterModule.forRoot( routes, { preloadingStrategy: PreloadAllModules } )
];