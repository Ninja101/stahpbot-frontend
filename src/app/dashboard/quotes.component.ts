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
import { Quote } from '../models/quote';
import { User } from '../models/user';

@Component({
	selector: 'sb-quotes',
	templateUrl: 'views/quotes.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
	`],
})
export class QuotesComponent
{
	@ViewChild( 'addModal' )
	public addModal: Modal;

	public quotes: Quote[] = [ ];
	public checked: any = { };
	public currEntry: Quote;

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
		private titleService: Title,
		private translateService: TranslateService
	)
	{
		let title = translateService.instant( 'sidebar.quotes' );

		breadcrumbService.addFriendlyNameForRoute( '/quotes', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		this.currEntry = new Quote( );
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
		this.quotes.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getQuotes( this.active_channel, this.page, this.per_page )
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
					this.quotes.push( new Quote( row ) );

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

	quoteAdd( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let quote = this.currEntry;

		if ( quote.exists )
			return;

		this.pending = true;

		quote.channel = this.active_channel.twitch_id;

		this.apiService.addQuote( quote )
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

	quoteDelete( )
	{
		this.alertsService.confirm({
			title: 'Are you sure?',
			text: 'This action cannot be undone.'
		}).then( success => {
			if ( this.pending )
				return;

			if ( !this.currEntry )
				return;

			let quote = this.currEntry;

			if ( false == quote.exists )
				return;

			this.pending = true;

			this.apiService.deleteQuote( quote )
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

			this.apiService.deleteQuoteMulti( ids, this.active_channel )
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
		this.currEntry = new Quote( );
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