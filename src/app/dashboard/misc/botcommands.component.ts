/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { BreadcrumbService } from '../../services/breadcrumb.service';
import { PagevarsService } from '../../services/pagevars.service';

@Component({
	selector: 'sb-commands-bot',
	templateUrl: 'views/bot-commands.html',
})
export class BotCommandsComponent
{
	constructor(
		private breadcrumbService: BreadcrumbService,
		private pagevarsService: PagevarsService,
		private title: Title
	)
	{
		breadcrumbService.addFriendlyNameForRoute( '/commands', 'Custom Commands' );
		breadcrumbService.addFriendlyNameForRoute( '/commands/bot', 'Bot Commands' );
		pagevarsService.setPageTitle( "Bot Commands" );
		title.setTitle( "Bot Commands - Stahpbot ");
	}
}