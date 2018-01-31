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

import { Blacklist } from '../models/blacklist';
import { Channel } from '../models/channel';
import { User } from '../models/user';

@Component({
	selector: 'sb-blacklist',
	templateUrl: 'views/blacklist.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
	`]
})
export class BlacklistComponent
{
	@ViewChild( 'addModal' )
	public addModal: Modal;

	public blacklist: Blacklist[] = [ ];
	public checked: any = { };
	public currEntry: Blacklist;
	public global: boolean;

	private active_channel: Channel;
	private user: User;

	public page: number = 1;
	public per_page: number = 15;
	public totalItems: number = 0;

	public validTypes: string[] = [ 'find', 'regex' ];

	public fetching: boolean = true;
	public pending: boolean = false;

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
		let title = translateService.instant( 'sidebar.blacklist' );

		breadcrumbService.addFriendlyNameForRoute( '/blacklist', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		this.currEntry = new Blacklist( );
		this.global = false;
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
		this.blacklist.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getBlacklist( this.active_channel, this.page, this.per_page )
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
					this.blacklist.push( new Blacklist( row ) );

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

	blacklistAdd( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let entry = this.currEntry;

		if ( entry.string.length == 0 || this.validTypes.indexOf( entry.type ) < 0 || entry.timeout_length < 0 )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Fields are not correctly filled out'
			});
			return;
		}

		if ( this.global && this.user.rank != 'owner' )
			return;

		entry.channel = ( this.global ? 0 : this.active_channel.twitch_id );

		this.pending = true;
		
		this.apiService.addBlacklist( entry )
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

	blacklistDelete( )
	{
		this.alertsService.confirm({
			title: 'Are you sure?',
			text: 'This action cannot be undone.'
		}).then( success => {
			if ( this.pending )
				return;

			if ( !this.currEntry )
				return;

			let entry = this.currEntry;

			this.pending = true;

			this.apiService.deleteBlacklist( entry )
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

	selectedDelete( )
	{
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

			this.apiService.deleteBlacklistMulti( ids, this.active_channel )
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

	clearSelected( )
	{
		this.checked = { };
	}

	clearVars( )
	{
		this.currEntry = new Blacklist( );
		this.global = false;
	}

	getHelpText( id: string )
	{
		return this.translateService.instant( 'help.' + id );
	}

	// Init Add

	onOpenAdd( )
	{
		
	}
}