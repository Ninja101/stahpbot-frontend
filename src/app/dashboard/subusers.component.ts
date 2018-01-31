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
import { TranslateService } from '../services/translate.service';

import { SubUser } from '../models/subuser';
import { User } from '../models/user';

@Component({
	selector: 'sb-subusers',
	templateUrl: 'views/subusers.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
	`],
})
export class SubUsersComponent
{
	@ViewChild( 'addModal' )
	public addModal: Modal;

	public subusers: SubUser[] = [ ];
	public currEntry: any;

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
		private translateService: TranslateService
	)
	{
		let title = translateService.instant( 'sidebar.sub-users' );

		breadcrumbService.addFriendlyNameForRoute( '/subusers', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.getUser( )
			.subscribe( user => this.onUserUpdate( user ) );

		this.currEntry = new SubUser( );
	}

	onUserUpdate( user: User )
	{
		this.user = user;
		this.getPage( 1 );
	}

	getPage( page: number )
	{
		this.subusers.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getSubUsers( this.page, this.per_page )
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
					this.subusers.push( new SubUser( row ) );

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

	subuserAdd( )
	{
		if ( this.pending )
			return;

		let user = this.currEntry;

		if ( user.username.length == 0 )
			return;

		this.pending = true;

		this.apiService.addSubUser( user )
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

	subuserEdit( )
	{
		if ( this.pending )
			return;

		let user = this.currEntry;

		if ( user.username.length == 0 )
			return;

		if ( false == user.exists )
			return;

		this.pending = true;

		this.apiService.editSubUser( user )
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

	subuserDelete( )
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

			this.pending = true;

			this.apiService.deleteSubUser( user )
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
		this.currEntry = new SubUser( );
	}
}