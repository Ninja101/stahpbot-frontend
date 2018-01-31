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
import { Donation } from '../models/donation';
import { User } from '../models/user';

@Component({
	selector: 'sb-donations-top',
	templateUrl: 'views/donations-top.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
		.donation-message
		{
			max-width: 300px;
			word-wrap: break-word;
		}
	`],
})
export class DonationsTopComponent
{
	public donations: any = [ ];

	private active_channel: Channel;
	private user: User;

	public page: number = 1;
	public per_page: number = 20;
	public totalItems: number = 0;

	public fetching: boolean = true;
	public not_allowed: boolean = false;

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
		breadcrumbService.addFriendlyNameForRoute( '/donations/top', 'Top Donations' );
		pagevarsService.setPageTitle( "Top Donations" );
		titleService.setTitle( "Top Donations - Stahpbot" );

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
		this.donations.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getDonationsTop( this.active_channel, this.page, this.per_page )
			.then( response => {
				this.fetching = false;
				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});

					if ( response.not_allowed )
						this.not_allowed = true;
					
					return;
				}

				this.donations = response.result;
				this.totalItems = response._count;
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