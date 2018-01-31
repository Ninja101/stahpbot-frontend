/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Modal } from 'ngx-modal';

import { AlertFormComponent } from '../include/alertform.component';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';

import { Alert } from '../models/alert';
import { Channel } from '../models/channel';
import { User } from '../models/user';

@Component({
	selector: 'sb-alerts',
	templateUrl: 'views/alerts.html',
	providers: [ AlertFormComponent ],
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
	`]
})
export class AlertsComponent
{
	@ViewChild( 'addModal' )
	public addModal: Modal;

	@ViewChild( 'alertForm' )
	public alertForm: AlertFormComponent;

	public alerts: Alert[] = [ ];
	public checked: any = { };
	public currEntry: Alert;

	public page: number = 1;
	public per_page: number = 20;
	public totalItems: number = 0;

	private active_channel: Channel;
	private user: User;

	public fetching: boolean = true;
	public pending: boolean = false;
	public not_allowed: boolean = false;

	public translate: any = {
		'subscriber': 'New Subscriber',
		'sub_share': 'Subscriber',
		'donation': 'Donation',
		'donation_top_month': 'Donation (Monthly Top)',
		'donation_top_day': 'Donation (Daily Top)',
		'follower': 'Follower',
		'hosted': 'Being Hosted',
		'bits': 'Bits Donation'
	};

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
		let title = translateService.instant( 'sidebar.alerts' );
		
		breadcrumbService.addFriendlyNameForRoute( '/alerts', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		this.currEntry = new Alert( );
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
		this.alerts.length = 0;
		this.page = page;
		this.fetching = true;

		this.apiService.getAlerts( this.active_channel, this.page, this.per_page )
			.then( res => {
				this.fetching = false;
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});

					if ( res.not_allowed )
						this.not_allowed = true;
					
					return;
				}

				for ( let alert of res.result )
					this.alerts.push( new Alert( alert ) );

				this.totalItems = res._count;
			})
			.catch( err => {
				this.fetching = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	getCheckedCount( )
	{
		if ( !this.checked )
			return 0;

		let count = 0;

		for ( let item in this.checked )
		{
			if ( this.checked[item] == true )
				count++;
		}

		return count;
	}

	alertAdd( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let alert = this.currEntry;

		if ( alert.exists )
			return;

		this.pending = true;

		alert.channel = this.active_channel.twitch_id;
		alert.items = this.alertForm.makeItems( );

		this.apiService.addAlert( alert )
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

				this.addModal.close( );
				this.getPage( this.page );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
				this.pending = false;
			});
	}

	alertEdit( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let alert = this.currEntry;

		if ( false == alert.exists )
			return;

		this.pending = true;

		alert.items = this.alertForm.makeItems( );

		this.apiService.editAlert( alert )
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

				this.addModal.close( );
				this.getPage( this.page );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
				this.pending = false;
			});
	}

	alertDelete( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		this.alertsService.confirm({
			title: 'Are you sure?',
			text: 'This action cannot be undone.'
		}).then( success => {
			if ( this.pending )
				return;

			if ( !this.currEntry )
				return;

			let alert = this.currEntry;

			if ( false == alert.exists )
				return;

			this.pending = true;
			this.clearVars( );

			this.apiService.deleteAlert( alert )
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
				})
				.catch( err => {
					this.alertsService.error({
						title: 'An error occurred',
						text: 'Server unavailable'
					});
					this.pending = false;
				});
		})
		.catch( err => { } );
	}

	selectedDelete( )
	{
		if ( this.pending )
				return;

		if ( this.getCheckedCount( ) == 0 )
			return;

		this.alertsService.confirm({
			title: 'Are you sure?',
			text: 'This action cannot be undone.'
		}).then( success => {
			if ( this.pending )
				return;

			if ( this.getCheckedCount( ) == 0 )
				return;

			for ( let idx in this.checked )
			{
				if ( !this.checked[idx] )
					delete this.checked[idx];
			}

			let ids = Object.keys( this.checked );

			this.pending = true;

			this.apiService.deleteAlertMulti( ids, this.active_channel )
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
				})
				.catch( err => {
					this.alertsService.error({
						title: 'An error occurred',
						text: 'Server unavailable'
					});
					this.pending = false;
				});
		})
		.catch( err => { } );
	}

	clearSelected( )
	{
		this.checked = { };
	}

	clearVars( )
	{
		this.currEntry = new Alert( );
	}

	getHelpText( setting: string )
	{
		return this.translateService.instant( 'help.' + setting );
	}
}