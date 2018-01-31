/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';

import { CookieService } from 'angular2-cookie/core';

import { AlertsService } from '../services/alerts.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';
import { TwitchAPIService } from '../services/twitchapi.service';
import { WebsocketService } from '../services/websocket.service';

import { Channel } from '../models/channel';
import { User } from '../models/user';

class Winner
{
	constructor( data: any )
	{
		if ( !data )
		{
			this.error = true;
			return;
		}

		this.error = false;
		this.name = data.name;
		this.moderator = data.mod;
		this.subscriber = data.sub;
		this.follower = data.follower;
	}

	public error: boolean = false;

	public name: string;
	public moderator: boolean;
	public subscriber: boolean;
	public follower: boolean;
	public logo: SafeResourceUrl = null;
}

class Keyword
{
	constructor( data: any )
	{
		this.text = data.text;
		this.duration = data.duration;
		this.starter = data.starter;
		this.level = data.level;

		this.counts.viewer = data.viewer_count;
		this.counts.sub = data.sub_count;
		this.counts.mod = data.mod_count;
	}

	public text: string;
	public duration: number = null;
	public starter: string;
	public level: number;

	public winner: Winner = null;
	public winner_msgs: any[] = [ ];

	public counts: any = {
		'viewer': 0,
		'sub': 0,
		'mod': 0
	};
}

@Component({
	selector: 'sb-giveaways',
	templateUrl: 'views/giveaways.html',
	styles: [`
		.winner-name{margin-left:20px;}.messages-well{height:160px;overflow-y:scroll;outline:1px solid #ddd;padding:5px;margin-top:5px;}
		.alert-danger{margin-top:5px;}.label-danger,.label-success{margin-right:10px;}
	`]
})
export class GiveawaysComponent
{
	public curr_keyword: Keyword = null;
	public running: boolean = false;
	private starting: boolean = false;

	public keywordText: string = "";
	public keywordLevel: number = 0;
	public keywordUseDuration: boolean = false;
	public keywordDuration: number = 60;
	public keywordAnnounce: boolean = true;

	private active_channel: Channel;
	public url: SafeResourceUrl = null;
	private user: User;

	public default_image: string = "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";

	public translate: any = {
		'level_0': 'Anyone',
		'level_1': 'Followers',
		'level_2': 'Subscribers'
	};

	constructor(
		private alertsService: AlertsService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private cookieService: CookieService,
		private domSanitizer: DomSanitizer,
		private pagevarsService: PagevarsService,
		private titleService: Title,
		private translateService: TranslateService,
		private twitchapiService: TwitchAPIService,
		private wsService: WebsocketService
	)
	{
		let title = translateService.instant( 'sidebar.giveaways' );

		breadcrumbService.addFriendlyNameForRoute( '/giveaways', title );
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
		this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(
			"https://www.twitch.tv/" + channel.name.toLowerCase( ) + "/chat"
		);

		let token = this.cookieService.get( "token" ),
			user_id = this.cookieService.get( "user_id" );

		this.wsService.connect( channel.twitch_id, token, parseInt( user_id ) );
		this.wsService.on( "authenticated", ( channel: number ) => this.wsAuthenticated( channel ) );
		this.wsService.on( "keyword_running", ( data: any ) => this.wsKeywordRunning( data ) );
		this.wsService.on( "keyword_abort", ( data?: any ) => this.wsKeywordAborted( data ) );
		this.wsService.on( "keyword_winner", ( data?: any ) => this.wsKeywordWinner( data ) );
		this.wsService.on( "keyword_update", ( data: any ) => this.wsKeywordUpdate( data ) );
		this.wsService.on( "keyword_message", ( data: any ) => this.wsKeywordMessage( data ) );
	}

	onUserUpdate( user: User )
	{
		this.user = user;
	}

	wsAuthenticated( channel: number )
	{
		console.log( 'Authenticated' );

		this.wsService.send( 'keyword_running' );
	}

	wsKeywordRunning( data: any )
	{
		if ( !data )
			return;
		
		this.curr_keyword = new Keyword( data );
		this.running = true;
		this.starting = false;
		this.keywordText = '';
	}

	wsKeywordAborted( data: any )
	{
		this.curr_keyword = null;
		this.running = false;
		this.starting = false;
	}

	wsKeywordWinner( data: any )
	{
		if ( !this.curr_keyword )
			return;

		this.curr_keyword.winner = new Winner( data );
		this.curr_keyword.winner_msgs.length = 0;

		this.running = false;

		if ( data )
		{
			this.twitchapiService.getChannel( data.twitch_id )
				.then( res => {
					this.curr_keyword.winner.logo = res.logo;
				})
				.catch( err => {
					console.log( 'Error getting user image', data.name, err );
				});
		}

		this.starting = false;
	}

	wsKeywordUpdate( data: any )
	{
		if ( !this.running || !this.curr_keyword )
			return;

		this.curr_keyword.counts.mod = data.mod_count;
		this.curr_keyword.counts.sub = data.sub_count;
		this.curr_keyword.counts.viewer = data.viewer_count;
	}

	wsKeywordMessage( data: any )
	{
		if ( !this.curr_keyword || !this.curr_keyword.winner )
			return;

		this.curr_keyword
			.winner_msgs
			.push({
				text: data,
				timestamp: Date.now( )
			});
	}

	// Actions

	startKeyword( )
	{
		if ( this.running )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'A keyword is already running'
			});
			return;
		}

		if ( this.keywordText.replace( " ", "" ).length == 0 )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Keyword text cannot be empty'
			});
			return;
		}

		this.wsService.send( 'keyword_start', {
			text: this.keywordText,
			duration: this.keywordUseDuration ? this.keywordDuration : 0,
			user_level: this.keywordLevel,
			announced: this.keywordAnnounce
		});

		this.starting = true;
	}

	abortKeyword( )
	{
		if ( !this.running )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'There is no keyword running'
			});
			return;
		}

		this.wsService.send( 'keyword_abort' );
		this.starting = true;
	}

	closeKeyword( )
	{
		if ( this.running )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'A keyword is still running'
			});
			return;
		}

		this.curr_keyword = null;
		this.starting = false;
	}

	pickWinner( )
	{
		if ( !this.running )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'There is no keyword running'
			});
			return;
		}

		this.wsService.send( 'keyword_pick' );
		this.starting = true;
	}

	rerollWinner( )
	{
		if ( this.running )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'A keyword is still running'
			});
			return;
		}

		this.wsService.send( 'keyword_pick' );
		this.starting = true;
	}
}