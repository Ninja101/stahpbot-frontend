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
import { Command } from '../models/command';
import { User } from '../models/user';

@Component({
	selector: 'sb-commands',
	templateUrl: 'views/commands.html',
	styles: [`
		#controls
		{
			margin-bottom: 10px;
		}
		a.text-shortcut
		{
			margin-right: 5px;
		}
	`],
})
export class CommandsComponent
{
	@ViewChild( 'addModal' )
	public addModal: Modal;

	public commands: Command[] = [ ];
	public checked: any = { };
	public currEntry: Command;
	public global: boolean;

	private active_channel: Channel;
	public user: User;

	public page: number = 1;
	public per_page: number = 15;
	public totalItems: number = 0;

	public fetching: boolean = true;
	public pending: boolean = false;

	public shortcuts: string[] = [ '{countdown:INSERT_DATE_HERE}', '{time:UTC+1}', '{input}', '{name}' ];
	public translate: any = {
		'{countdown:INSERT_DATE_HERE}': 'Countdown',
		'{input}': 'User Input',
		'{name}': 'Username',
		'{time:UTC+1}': 'Local Time',
		'{value}': 'Value'
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
		let title = translateService.instant( 'sidebar.commands' );

		breadcrumbService.addFriendlyNameForRoute( '/commands', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		this.currEntry = new Command( );
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
		this.commands.length = 0;
		this.page = Math.max( page, 1 );
		this.fetching = true;

		this.apiService.getCommands( this.active_channel, this.page, this.per_page )
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

	commandAdd( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let cmd = this.currEntry;

		if ( cmd.exists )
			return;

		if ( cmd.command.length == 0 || ( cmd.response.length == 0 && cmd.format.length == 0 ) || cmd.cooldown == 0 )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Fields are not correctly filled out'
			});
			return;
		}

		if ( this.global && this.user.rank != 'owner' )
			return;

		this.pending = true;

		cmd.channel = ( this.global ? 0 : this.active_channel.twitch_id );

		this.apiService.addCommand( cmd )
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

	commandEdit( )
	{
		if ( this.pending )
			return;

		if ( !this.currEntry )
			return;

		let cmd = this.currEntry;

		if ( false == cmd.exists )
			return;

		if ( cmd.command_id <= 0 || cmd.command.length == 0 || ( cmd.response.length == 0 && cmd.format.length == 0 ) || cmd.cooldown == 0 )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Fields are not correctly filled out'
			});
			return;
		}

		if ( this.global && this.user.rank != 'owner' )
			return;

		this.pending = true;

		cmd.channel = ( this.global ? 0 : this.active_channel.twitch_id );

		this.apiService.editCommand( cmd )
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

	commandDelete( )
	{
		this.alertsService.confirm({
			title: 'Are you sure?',
			text: 'This action cannot be undone.'
		}).then( success => {
			if ( this.pending )
				return;

			if ( !this.currEntry )
				return;

			let cmd = this.currEntry;

			if ( false == cmd.exists )
				return;

			this.pending = true;

			this.apiService.deleteCommand( cmd )
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

			this.apiService.deleteCommandMulti( ids, this.active_channel )
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
		this.currEntry = new Command( );
		this.global = false;
	}

	getHelpText( id: string )
	{
		return this.translateService.instant( 'help.' + id );
	}

	// Shortcuts

	insertResponse( shortcut: string )
	{
		if ( !this.currEntry )
			return;

		let dt = ( new Date( ) ).toISOString( ).replace( /(\.\d{1,3})Z$/, 'Z' );
		shortcut = shortcut.replace( "INSERT_DATE_HERE", dt );

		this.currEntry.response += shortcut;
	}

	insertFormat( shortcut: string )
	{
		if ( !this.currEntry || !this.currEntry.editable )
			return;

		let dt = ( new Date( ) ).toISOString( ).replace( /(\.\d{1,3})Z$/, 'Z' );
		shortcut = shortcut.replace( "INSERT_DATE_HERE", dt );

		this.currEntry.format += shortcut;
	}
}