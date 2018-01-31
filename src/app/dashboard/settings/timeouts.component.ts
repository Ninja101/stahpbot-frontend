/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { AfterViewInit, Component } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AlertsService } from '../../services/alerts.service';
import { APIService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { PagevarsService } from '../../services/pagevars.service';
import { TranslateService } from '../../services/translate.service';

import { Channel } from '../../models/channel';
import { User } from '../../models/user';
import { Whitelist } from '../../models/whitelist';

@Component({
	selector: 'sb-settings-timeouts',
	templateUrl: '../views/settings/timeouts.html',
	animations: [
		trigger( 'btnState', [
			state( 'update', style( { opacity: 1 } ) ),
			state( 'error', style( { opacity: 1 } ) ),
			state( 'updated', style( { opacity: 1 } ) ),
			transition( 'update => error, update => updated, updated => update', [
				animate( 100, style( { opacity: 0 } ) ),
				animate( 250, style( { opacity: 1 } ) )
			])
		])
	]
})
export class SettingsTimeoutsComponent implements AfterViewInit
{
	public settings: any = { };
	public original: any = { };
	public updating: boolean = false;
	public updated: boolean = false;
	public not_allowed: boolean = false;

	public whitelist: Whitelist[] = [ ];

	private active_channel: Channel;
	private user: User;

	public whitelistPage: number = 1;
	public whitelistPerPage: number = 10;
	public whitelistCount: number;
	public whitelistDomain: string;

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
		breadcrumbService.addFriendlyNameForRoute( '/settings', 'Settings' );
		breadcrumbService.addFriendlyNameForRoute( '/settings/timeouts', 'Timeouts' );
		pagevarsService.setPageTitle( "Timeout Settings" );
		titleService.setTitle( "Timeout Settings - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);
	}

	ngAfterViewInit( )
	{
		
	}

	onChannelUpdate( channel: Channel )
	{
		this.active_channel = channel;

		this.apiService.getSettings( channel )
			.then( response => {
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

				for ( let name in response.result )
				{
					let val = response.result[name];
					
					if ( false == isNaN( parseInt( val ) ) )
						val = parseInt( val );

					this.settings[name] = val;
					this.original[name] = val;
				}
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});

		this.apiService.getWhitelist( channel, this.whitelistPage, this.whitelistPerPage )
			.then( response => {
				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});
					return;
				}

				this.whitelist.length = 0;

				for ( let row of response.result )
					this.whitelist.push( new Whitelist( row ) );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	onUserUpdate( user: User )
	{
		this.user = user;
	}

	getWhitelistPage( page: number )
	{
		this.whitelist.length = 0;
		this.whitelistPage = page;

		this.apiService.getWhitelist( this.active_channel, this.whitelistPage, this.whitelistPerPage )
			.then( response => {
				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});
					return;
				}

				for ( let row of response.result )
					this.whitelist.push( new Whitelist( row ) );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	getHelpText( setting: string )
	{
		return this.translateService.instant( 'setting.help.' + setting );
	}

	updateSettings( )
	{
		let changed = { };

		for ( let name in this.settings )
		{
			if ( this.settings[name] != this.original[name] )
				changed[name] = this.settings[name];
		}

		if ( Object.keys( changed ).length == 0 )
			return;

		this.updating = true;

		this.apiService.updateSettings( this.active_channel, changed )
			.then( res => {
				this.updating = false;
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				this.onChannelUpdate( this.active_channel );

				this.updated = true;
				setTimeout( ( ) => this.updated = false, 2000 );
			})
			.catch( err => {
				this.updating = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	addWhitelist( )
	{
		if ( !this.whitelistDomain || this.whitelistDomain.length == 0 )
			return;

		this.apiService.addWhitelist( this.active_channel, this.whitelistDomain )
			.then( res => {
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				this.whitelistDomain = "";
				this.getWhitelistPage( this.whitelistPage );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	deleteWhitelist( whitelist: Whitelist )
	{
		this.apiService.deleteWhitelist( whitelist.whitelist_id, whitelist.channel )
			.then( res => {
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				this.getWhitelistPage( this.whitelistPage );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}
}