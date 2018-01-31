/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';

import { Channel } from '../models/channel';
import { Event } from '../models/event';
import { User } from '../models/user';

@Component({
	selector: 'sb-events',
	templateUrl: 'views/events.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
	`]
})
export class EventsComponent
{
	public events: Event[] = [ ];

	private active_channel: Channel;
	private user: User;

	public loading: boolean = false;
	public page: number = 1;
	public per_page: number = 25;
	public totalItems: number = 0;

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private pagevarsService: PagevarsService,
		private titleService: Title,
		private translateService: TranslateService
	)
	{
		let title = translateService.instant( 'sidebar.events' );

		breadcrumbService.addFriendlyNameForRoute( '/events', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);
	}

	onChannelUpdate( channel: Channel )
	{
		this.active_channel = channel;
		this.getPage( 1 );
	}

	onUserUpdate( user: User )
	{
		this.user = user;
	}

	getPage( page: number )
	{
		this.loading = true;
		this.events.length = 0;
		this.page = Math.max( page, 1 );

		this.apiService.getEvents( this.active_channel, this.page, this.per_page )
			.then( response => {
				this.loading = false;

				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});
					return;
				}

				for ( let row of response.result )
					this.events.push( new Event( row ) );

				this.totalItems = response._count;
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}
}