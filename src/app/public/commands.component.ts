/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Modal } from 'ngx-modal';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';

import { Channel } from '../models/channel';
import { Command } from '../models/command';
import { User } from '../models/user';

@Component({
	selector: 'sb-commands',
	templateUrl: 'views/commands.html',
})
export class PublicCommandsComponent implements OnInit
{
	public commands: Command[] = [ ];
    public channel: string = '';

	public page: number = 1;
	public per_page: number = 15;
	public totalItems: number = 0;

	public fetching: boolean = true;
	public pending: boolean = false;

	constructor(
        private activatedRoute: ActivatedRoute,
        private alertsService: AlertsService,
		private apiService: APIService,
		private breadcrumbService: BreadcrumbService,
		private pagevarsService: PagevarsService,
		private titleService: Title,
		private translateService: TranslateService
	)
	{
		let title = translateService.instant( 'sidebar.commands' );

        breadcrumbService.addFriendlyNameForRoute( '/commands', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );
	}

    ngOnInit( )
	{
		this.activatedRoute.params.forEach( ( params: Params ) => {
			if ( !params['channel'] )
				return;
				
			let channel = params['channel'];

            this.breadcrumbService.addFriendlyNameForRoute( '/commands/' + channel, channel );

			this.channel = channel;
			this.getPage( 1 );
		});
    }

	getPage( page: number )
	{
		this.commands.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getPublicCommands( this.channel, this.page, this.per_page )
			.then( response => {
				this.fetching = false;
				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});
					return;
				}

				for ( let row of response.result )
					this.commands.push( new Command( row ) );

				this.totalItems = response._count;

                this.breadcrumbService.addFriendlyNameForRoute( '/commands/' + this.channel, response.name );
			})
			.catch( err => {
				this.fetching = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}
}