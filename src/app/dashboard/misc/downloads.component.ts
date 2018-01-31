/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { BreadcrumbService } from '../../services/breadcrumb.service';
import { PagevarsService } from '../../services/pagevars.service';

@Component({
	selector: 'sb-downloads',
	templateUrl: 'views/downloads.html',
})
export class DownloadsComponent
{
	constructor(
		private breadcrumbService: BreadcrumbService,
		private pagevarsService: PagevarsService,
		private title: Title
	)
	{
		breadcrumbService.addFriendlyNameForRoute( '/downloads', 'Downloads' );
		pagevarsService.setPageTitle( "Downloads" );
		title.setTitle( "Downloads - Stahpbot ");
	}
}