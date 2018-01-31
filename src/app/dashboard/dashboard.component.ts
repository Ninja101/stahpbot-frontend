/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';

import { CookieService } from 'angular2-cookie/core';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { NotificationService } from '../services/notification.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';
import { TwitchAPIService } from '../services/twitchapi.service';
import { WebsocketService } from '../services/websocket.service';

import { Channel } from '../models/channel';
import { Event } from '../models/event';
import { Notification } from '../models/notification';
import { User } from '../models/user';

import { environment } from '../../environments/environment';

import { sprintf } from 'sprintf-js';

@Component({
	selector: 'sb-dashboard',
	templateUrl: 'views/index.html',
	encapsulation: ViewEncapsulation.None,
	styles: [`
		#manage-alerts .btn
		{
			margin: 5px 0px;
			width: 165px;
		}
		@media(max-width:1100px) {
			#chat_frame
			{
				height: 600px;
			}
		}
	`]
})
export class DashboardComponent
{
	public usageData: any = { message_rate: 0, messages: null, chatters: null, load: "0%", uptime_unix: 0, uptime: "N/A" };

	public channel_events: Event[] = [ ];
	public web_events: Event[] = [ ];
	
	private active_channel: Channel;
	public chat_url: SafeResourceUrl;
	public user: User;

	public subscribers: number = null;
	public timeouts: number = null;

	public fetching: boolean = true;

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private cookieService: CookieService,
		private domSanitizer: DomSanitizer,
		private notificationService: NotificationService,
		private pagevarsService: PagevarsService,
		private titleService: Title,
		private translateService: TranslateService,
		private twitchapiService: TwitchAPIService,
		private wsService: WebsocketService
	)
	{
		let title = translateService.instant( 'sidebar.dashboard' );

		breadcrumbService.addFriendlyNameForRoute( '/', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		setInterval( this.getInfo.bind( this ), 300 * 1000 );
		setInterval( this.getUptime.bind( this ), 1000 );
	}

	onChannelUpdate( channel: Channel )
	{
		this.active_channel = channel;

		if ( environment.production )
			this.chat_url = this.domSanitizer.bypassSecurityTrustResourceUrl( "//twitch.tv/" + channel.name.toLowerCase( ) + "/chat" );

		this.channel_events.length = 0;
		this.fetching = true;
		this.newTitle = null;
		this.usageData.chatters = null;
		this.usageData.messages = null;

		this.apiService.getDashboard( channel )
			.then( res => {
				if ( res.error )
					return;
				
				let val = res.result;
				this.subscribers = val.subscribers;

				if ( val.events )
					this.timeouts = ( ( +val.events.timeout || 0 ) + ( +val.events.ban || 0 ) );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Failed to load dashboard, please try again later.'
				});
			});

		this.apiService.getEventsRecent( channel )
			.then( res => {
				this.fetching = false;
				
				if ( res.error )
					return;
				
				for ( let event of res.result )
					this.channel_events.push( new Event( event ) );
			})
			.catch( err => {
				this.fetching = false;
				console.warn( "Failed to get recent events" );
			});

		let token = this.cookieService.get( "token" ),
			user_id = this.cookieService.get( "user_id" );

		this.wsService.connect( channel.twitch_id, token, parseInt( user_id ) );
		this.wsService.on( "alert_action", ( res: any ) => this.onWSAlertAction( res ) );
		this.wsService.on( "authenticated", ( channel: number ) => this.wsService.send( 'send_usage' ) );
		this.wsService.on( "bot_modded", ( res: any ) => this.onWSModded( res ) );
		this.wsService.on( "new_event", ( data: any ) => this.onWSEvent( data ) );
		this.wsService.on( "update_usage", ( data: any ) => this.onWSUsage( data ) );

		this.getInfo( );
	}

	onUserUpdate( user: User )
	{
		this.user = user;
	}
	
	getInfo( )
	{
		this.twitchapiService.getChatters( this.active_channel.raw )
			.then( value => this.usageData.chatters = value )
			.catch( err => this.usageData.chatters = 0 );

		this.twitchapiService.getStreamTitle( this.active_channel.twitch_id )
			.then( value => this.newTitle = value )
			.catch( err => this.newTitle = "" );
	}

	getUptime( )
	{
		if ( this.usageData.uptime_unix == 0 )
			return;

		this.usageData.uptime_unix++;

		let seconds = this.usageData.uptime_unix;
		let d = Math.floor( seconds / 86400 );
		seconds -= d * 86400;
		let h = Math.floor( seconds / 3600 );
		seconds -= h * 3600;
		let m = Math.floor( seconds / 60 );
		seconds -= m * 60;
		let s = Math.floor( seconds );
		this.usageData.uptime = sprintf( "%dd %dh %dm %ds", d, h, m, s );
	}

	onWSUsage( data: any )
	{
		let now = ( Date.now( ) / 1000 ),
			uptime = Math.max( 1, now - data.start_time );

		this.usageData.load = Math.max( 0, Math.round( ( data.cpu + data.mem ) / 2 ) ) + "%";
		this.usageData.messages = data.messages_today;
		this.usageData.uptime_unix = uptime;
	}

	onWSEvent( data: any )
	{
		if ( data.type == 'subscriber' )
			this.subscribers++;

		if ( [ 'timeout', 'ban' ].indexOf( data.type ) >= 0 )
			this.timeouts++;

		this.channel_events.unshift( new Event( data ) );
	}

	private notified_mod: boolean = false;

	onWSModded( result: boolean )
	{
		if ( result )
			return;

		if ( this.notified_mod )
			return;

		this.notified_mod = true;

		let notif = new Notification( );
		notif.id = -1;
		notif.icon = 'warning';
		notif.severity = 'danger';
		notif.text = 'You have not modded Stahpbot in your channel. The bot can\'t write or timeout in your channel. Type "/mod Stahpbot" in chat to enable the bot.';
		notif.link = 'https://twitch.tv/' + this.active_channel.name;
		notif.timestamp = ( Date.now( ) / 1000 );
		notif.is_read = false;
		this.notificationService.addNotification( notif );
	}

	onWSAlertAction( success: boolean )
	{
		this.alertRunning = false;

		if ( !success )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Failed to send the alert action to the server, please try again later.'
			});
		}
	}

	// Actions

	public newTitle: string = null;
	public titleRunning: boolean = false;

	public commercialDuration: number = 30;
	public commercialRunning: boolean = false;

	public alertRunning: boolean = false;

	refreshTitle( )
	{
		if ( this.titleRunning )
			return;

		this.newTitle = null;

		this.twitchapiService.getStreamTitle( this.active_channel.twitch_id )
			.then( value => this.newTitle = value )
			.catch( err => this.newTitle = "" );
	}

	updateTitle( )
	{
		if ( this.titleRunning )
			return;

		this.titleRunning = true;

		this.apiService.setStreamTitle( this.active_channel, this.newTitle )
			.then( res => {
				this.titleRunning = false;
			})
			.catch( err => {
				this.titleRunning = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'We were unable to set the stream title, please try again later.'
				});
			});
	}

	runCommercial( )
	{
		if ( this.commercialRunning )
			return;

		this.commercialRunning = true;

		this.apiService.setCommercial( this.active_channel, this.commercialDuration )
			.then( res => {
				this.commercialRunning = false;
			})
			.catch( err => {
				this.commercialRunning = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Failed to run the commercial, please try again later.'
				});
			});
	}

	wsTestSub( )
	{
		if ( this.alertRunning )
			return;

		if ( !this.wsService.authed )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Unable to send test alert, please try again later.'
			});
			return;
		}

		this.alertRunning = true;
		this.wsService.send( "test_subscriber" );
	}

	wsTestResub( )
	{
		if ( this.alertRunning )
			return;

		if ( !this.wsService.authed )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Unable to send test alert, please try again later.'
			});
			return;
		}

		this.alertRunning = true;
		this.wsService.send( "test_resubscriber" );
	}

	wsTestDonation( )
	{
		if ( this.alertRunning )
			return;

		if ( !this.wsService.authed )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Unable to send test alert, please try again later.'
			});
			return;
		}

		this.alertRunning = true;
		this.wsService.send( "test_donation" );
	}

	wsStopTTS( )
	{
		if ( this.alertRunning )
			return;

		if ( !this.wsService.authed )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Unable to send test alert, please try again later.'
			});
			return;
		}

		this.alertRunning = true;
		this.wsService.send( "stop_tts" );
	}

	wsStopAlert( )
	{
		if ( this.alertRunning )
			return;
		
		if ( !this.wsService.authed )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Unable to send test alert, please try again later.'
			});
			return;
		}

		this.alertRunning = true;
		this.wsService.send( "stop_alert" );
	}

	wsReloadAlerts( )
	{
		if ( this.alertRunning )
			return;

		if ( !this.wsService.authed )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Unable to send test alert, please try again later.'
			});
			return;
		}

		this.alertRunning = true;
		this.wsService.send( "reload_alerts" );
	}

	getText( key: string )
	{
		return this.translateService.instant( 'dashboard.' + key );
	}
}