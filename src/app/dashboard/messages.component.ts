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
import { Message } from '../models/message';
import { User } from '../models/user';

@Component({
	selector: 'sb-messages',
	templateUrl: 'views/messages.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
	`],
})
export class MessagesComponent
{
	@ViewChild( 'addModal' )
	public addModal: Modal;

	public messages: Message[] = [ ];
	public checked: any = { };
	public currEntry: Message;

	private active_channel: Channel;
	private user: User;

	public page: number = 1;
	public per_page: number = 15;
	public totalItems: number = 0;

	public fetching: boolean = true;
	public pending: boolean = false;

	public validTypes: string[] = [ 'scheduled', 'donation', 'subscriber', 'resubscriber', 'sub_share', 'new_tweet', 'new_youtube' ];

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
		let title = translateService.instant( 'sidebar.messages' );

		breadcrumbService.addFriendlyNameForRoute( '/messages', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		this.currEntry = new Message( );
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
		this.messages.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getMessages( this.active_channel, this.page, this.per_page )
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
					this.messages.push( new Message( row ) );

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

	messageAdd( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let entry = this.currEntry;

		if ( entry.exists )
			return;

		if ( entry.text.length == 0 || this.validTypes.indexOf( entry.type ) < 0 || ( entry.type == 'scheduled' && entry.interval < 60 ) )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Fields are not correctly filled out'
			});
			return;
		}

		this.pending = true;

		entry.channel = this.active_channel.twitch_id;

		this.apiService.addMessage( entry )
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

	messageEdit( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let entry = this.currEntry;

		if( false == this.currEntry.exists )
			return;

		if ( entry.message_id <= 0 || entry.text.length == 0 || this.validTypes.indexOf( entry.type ) < 0 || ( entry.type == 'scheduled' && entry.interval < 60 ) )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Fields are not correctly filled out'
			});
			return;
		}

		this.pending = true;

		this.apiService.editMessage( entry )
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

	messageDelete( )
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

			if( false == this.currEntry.exists )
				return;

			this.pending = true;

			this.apiService.deleteMessage( entry )
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

			this.apiService.deleteMessageMulti( ids, this.active_channel )
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
		this.currEntry = new Message( );
	}

	getTypeName( type: string )
	{
		if ( type == 'scheduled' )
			return 'Scheduled';
		if ( type == 'donation' )
			return 'New Donation';
		if ( type == 'subscriber' )
			return 'New Subscriber';
		if ( type == 'resubscriber' )
			return 'Re-Subscribed';
		if ( type == 'sub_share' )
			return 'Continued Subscriber';
		if ( type == 'new_tweet' )
			return 'New Tweet';
		if ( type == 'new_youtube' )
			return 'New YouTube Video';

		return '???';
	}

	getHelpText( id: string )
	{
		return this.translateService.instant( 'help.' + id );
	}

	getExample( type: string )
	{
		return this.translateService.instant_html( 'help.message.type.' + type );
	}

	// Init Add

	onOpenAdd( )
	{
		
	}
}