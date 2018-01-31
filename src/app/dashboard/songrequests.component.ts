/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';

import { Channel } from '../models/channel';
import { SongRequest } from '../models/songrequest';
import { User } from '../models/user';

import { sprintf } from 'sprintf-js';
import * as YoutubePlayer from 'youtube-iframe-player';

@Component({
	selector: 'sb-songrequests',
	templateUrl: 'views/songrequests.html',
	styleUrls: [ '../include/songrequests.css' ]
})
export class SongRequestsComponent implements AfterViewInit
{
	private checkTimer: any = null;
	public requests: SongRequest[] = [ ];
	public played: number[] = [ ];
	public playing: SongRequest = null;

	private active_channel: Channel;
	private user: User;

	public autoplay: boolean = false;
	public volume: number = 50;

	private player: any;
	public currState: number = -1;

	public currTimer: any = null;
	public currTime: string = '00:00';
	public currDuration: string = '00:00';

	public loading: boolean = false;
	public ready: boolean = false;

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private changeDetectorRef: ChangeDetectorRef,
		private pagevarsService: PagevarsService,
		private titleService: Title,
		private translateService: TranslateService
	)
	{
		let title = translateService.instant( 'sidebar.songrequests' );

		breadcrumbService.addFriendlyNameForRoute( '/songrequests', title );
		pagevarsService.setPageTitle( title );
		titleService.setTitle( title + " - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		this.autoplay = ( localStorage.getItem( 'autoplay' ) === 'true' );
		this.volume = parseInt( localStorage.getItem( 'volume' ) ) || 50;

		this.checkTimer = setInterval( ( ) => this.checkNewRequests( ), 30000 );
	}

	onChannelUpdate( channel: Channel )
	{
		let playing_id = ( this.playing && this.playing.playing ? this.playing.request_id : -1 );

		this.requests.length = 0;
		this.active_channel = channel;
		this.loading = true;

		this.apiService.getSongRequests( channel )
			.then( response => {
				this.loading = false;

				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});
					return;
				}

				for ( let row of response.result )
				{
					let req = new SongRequest( row );

					if ( req.request_id == playing_id )
					{
						req.playing = true;
						this.playing = req;
					}

					this.requests.push( req );
				}

				this.changeDetectorRef.detectChanges( );
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

	checkNewRequests( )
	{
		let request_id = this.getLastRequestId( );

		if ( request_id >= 0 )
			this.loadRequests( request_id );
		else
			this.onChannelUpdate( this.active_channel );
	}

	loadRequests( offset: number )
	{
		this.loading = true;

		this.apiService.getSongRequests( this.active_channel, offset )
			.then( response => {
				this.loading = false;

				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});
					return;
				}

				for ( let row of response.result )
					this.requests.push( new SongRequest( row ) );

				this.changeDetectorRef.detectChanges( );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	requestDelete( request: SongRequest )
	{
		if ( request.playing )
		{
			this.ytStop( );
			this.playing = null;
		}

		this.apiService.deleteSongRequest( request )
			.then( res => {
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				this.onChannelUpdate( this.active_channel );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	// Youtube

	private ytStates: any =  {
		'-1': 'unstarted',
		0: 'ended',
		1: 'playing',
		2: 'paused',
		3: 'buffering',
		5: 'video cued'
	};

	ngAfterViewInit( )
	{
		YoutubePlayer.init( ( ) => {
			this.player = YoutubePlayer.createPlayer( 'youtube-player', {
				height: 270,
				width: 480,
				playerVars: {
					controls: 0,
					disablekb: 0,
					fs: 0,
					iv_load_policy: 3,
					modestbranding: 1
				},
				events: {
					'onReady': ( ) => this.onReady( ),
					'onStateChange': ( event: any ) => this.onYTStateChange( event )
				}
			});
		});
	}

	onReady( )
	{
		this.ready = true;

		this.player.setVolume( this.volume );

		if ( this.autoplay )
			this.ytPlayNextRequest( );

		this.currTimer = setInterval( ( ) => this.currTimerUpdate( ), 1000 );

		this.changeDetectorRef.detectChanges( );
	}

	onYTStateChange( event: any )
	{
		this.currState = event.data;

		if ( !this.playing )
			return;

		if ( this.currState == 5 )
		{
			this.currDuration = '00:00';
			this.playing.playing = false;
		}
		else if ( this.currState == 0 )
		{
			this.currDuration = '00:00';

			this.playing.playing = false;
			this.markPlayed( this.playing, true );
		}
		else if ( this.currState == 1 || this.currState == 3 )
		{
			this.playing.playing = true;

			let duration = this.player.getDuration( ),
				minutes = Math.floor( duration / 60 ),
				seconds = duration - ( minutes * 60 );

			this.currDuration = sprintf( "%02d:%02d", minutes, seconds );
		}

		this.changeDetectorRef.detectChanges( );
	}

	ytPlayNextRequest( )
	{
		let request = this.getNextRequest( );

		if ( !request )
			return;

		this.playing = request;
		this.player.loadVideoById( request.url );
		this.player.playVideo( );

		console.log( "ytPlayNextRequest", request );
	}

	ytPlayPause( )
	{
		if ( ( this.currState < 1 || this.currState == 5 ) && ( !this.playing || !this.playing.playing ) )
		{
			this.ytPlayNextRequest( );
		}
		else if ( this.currState == 1 )
		{
			this.player.pauseVideo( );
		}
		else if ( this.currState == 2 )
		{
			this.player.playVideo( );
		}
	}

	ytStop( )
	{
		if ( this.currState < 1 || this.currState == 5 )
			return;

		this.player.stopVideo( );
	}

	ytSkip( )
	{
		if ( this.currState < 1 || this.currState == 5 )
			return;

		this.player.stopVideo( );

		this.markPlayed( this.playing, true );
		this.ytPlayNextRequest( );
	}

	// Utility

	currTimerUpdate( )
	{
		if ( !this.playing )
		{
			this.currTime = '00:00';
			return;
		}

		let duration = this.player.getCurrentTime( ),
			minutes = Math.floor( duration / 60 ),
			seconds = duration - ( minutes * 60 );

		this.currTime = sprintf( "%02d:%02d", minutes, seconds );

		this.changeDetectorRef.detectChanges( );
	}

	getNextRequest( ): SongRequest
	{
		if ( this.requests.length == 0 )
			return null;

		for ( let request of this.requests )
		{
			if ( request.playing || this.played.indexOf( request.request_id ) >= 0 )
				continue;

			return request;
		}

		return null;
	}

	getLastRequestId( )
	{
		if ( this.requests.length == 0 )
			return -1;

		let request = this.requests[this.requests.length - 1];
		return request.request_id;
	}

	markPlayed( request: SongRequest, clearPlayed: boolean )
	{
		this.played.push( request.request_id );

		if ( clearPlayed )
		{
			this.playing.playing = false;
			this.playing = null;
		}

		this.apiService.deleteSongRequest( request )
			.then( res => {
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				this.onChannelUpdate( this.active_channel );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	setVolume( event: any )
	{
		let value = event.target.value;
		this.player.setVolume( value );
		localStorage.setItem( 'volume', value.toString( ) );
	}

	toggleAutoplay( event: any )
	{
		let checked = event.target.checked;
		localStorage.setItem( 'autoplay', checked.toString( ) );
	}
}