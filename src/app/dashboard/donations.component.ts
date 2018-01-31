/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Modal } from 'ngx-modal';

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
	selector: 'sb-donations',
	templateUrl: 'views/donations.html',
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
export class DonationsComponent
{
	public donations: Donation[] = [ ];
	public currEntry: Donation;

	private active_channel: Channel;
	private user: User;

	public page: number = 1;
	public per_page: number = 15;
	public totalItems: number = 0;

	public fetching: boolean = true;
	public pending: boolean = false;
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
		let title = translateService.instant( 'sidebar.donations' );

		breadcrumbService.addFriendlyNameForRoute( '/donations', title );
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
		this.donations.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getDonations( this.active_channel, this.page, this.per_page )
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

				for ( let row of response.result )
					this.donations.push( new Donation( row ) );

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

	donationDelete( )
	{
		this.alertsService.confirm({
			title: 'Are you sure?',
			text: 'This action cannot be undone.'
		}).then( success => {
			if ( this.pending )
				return;

			if ( !this.currEntry )
				return;

			let donation = this.currEntry;

			this.pending = true;

			this.apiService.deleteDonation( donation )
				.then( res => {
					this.pending = false;
					if ( res.error )
					{
						this.alertsService.error({
							title: 'An error occurred',
							text: res.error
						});
						return;
					}

					this.getPage( this.page );
					this.clearVars( );
				})
				.catch( err => {
					this.alertsService.error({
						title: 'An error occurred',
						text: 'Server unavailable'
					});
					this.pending = false;
				});
		}).catch( err => { } );
	}

	clearVars( )
	{
		this.currEntry = null;
	}
}