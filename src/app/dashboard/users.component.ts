/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Modal } from 'ngx-modal';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TwitchAPIService } from '../services/twitchapi.service';

import { Channel } from '../models/channel';
import { User } from '../models/user';

@Component({
	selector: 'sb-users',
	templateUrl: 'views/users.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
	`],
})
export class UsersComponent
{
	@ViewChild( 'addModal' )
	public addModal: Modal;

	public users: any[] = [ ];
	public currEntry: User;

	private active_channel: Channel;
	private user: User;

	public page: number = 1;
	public per_page: number = 15;
	public totalItems: number = 0;

	public fetching: boolean = true;
	public pending: boolean = false;

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private pagevarsService: PagevarsService,
		private router: Router,
		private titleService: Title,
		private twitchAPIService: TwitchAPIService
	)
	{
		breadcrumbService.addFriendlyNameForRoute( '/users', 'Users' );
		pagevarsService.setPageTitle( "Users" );
		titleService.setTitle( "Users - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		this.currEntry = new User( );
	}

	onChannelUpdate( channel: Channel )
	{
		this.active_channel = channel;
	}

	onUserUpdate( user: User )
	{
		if ( user && user.rank != 'owner' )
		{
			this.router.navigate( [ '/' ] );
			return;
		}

		this.user = user;
		this.getPage( 1 );
	}

	getPage( page: number )
	{
		this.users.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getUsers( this.page, this.per_page )
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
					this.users.push( new User( row ) );

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

	userAdd( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let user = this.currEntry;

		if ( user.exists )
			return;

		this.pending = true;

		this.apiService.addUser( user )
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

	userEdit( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let user = this.currEntry;

		if ( false == user.exists )
			return;

		this.pending = true;

		this.apiService.editUser( user )
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

	userToggle( user: User )
	{
		if ( this.pending )
			return;

		if ( false == user.exists )
			return;

		this.pending = true;

		this.apiService.toggleUser( user )
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
	}

	userDelete( )
	{
		this.alertsService.confirm({
			title: 'Are you sure?',
			text: 'This action cannot be undone.'
		}).then( success => {
			if ( this.pending )
				return;

			if ( !this.currEntry )
				return;

			let user = this.currEntry;

			if ( false == user.exists )
				return;

			this.pending = true;

			this.apiService.deleteUser( user )
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
		this.currEntry = new User( );
	}

	// Utility

	getTwitchId( username: string )
	{
		this.twitchAPIService.getTwitchId( username )
			.then( twitch_id => {
				this.currEntry.twitch_id  = twitch_id;
			})
			.catch( err => {
				this.currEntry.twitch_id = null;
			});
	}
}