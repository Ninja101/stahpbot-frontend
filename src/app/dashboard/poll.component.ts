/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';

import { CookieService } from 'angular2-cookie/core';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';

import { Channel } from '../models/channel';
import { User } from '../models/user';

@Component({
	selector: 'sb-poll',
	templateUrl: 'views/poll.html'
})
export class PollComponent
{
	public poll_url: SafeResourceUrl = null;
	public poll_url_text: string = '';
	public running: boolean = false;
	public starting: boolean = false;

	public pollQuestion: string;
	public pollAnswers: string[] = [ '', '' ];
	public pollAnswersIdx: number[] = [ 0, 1 ];
	public pollMulti: boolean = false;
	public pollDupeCheck: boolean = true;
	public pollCaptcha: boolean = true;

	private active_channel: Channel;
	private user: User;

	public url: SafeResourceUrl = null;

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private cookieService: CookieService,
		private domSanitizer: DomSanitizer,
		private http: Http,
		private pagevarsService: PagevarsService,
		private titleService: Title,
		private translateService: TranslateService
	)
	{
		let title = translateService.instant( 'sidebar.poll' );

		breadcrumbService.addFriendlyNameForRoute( '/poll', title );
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
	}

	onUserUpdate( user: User )
	{
		this.user = user;
	}

	addAnswer( )
	{
		this.pollAnswers.push( '' );
		this.pollAnswersIdx.push( this.pollAnswersIdx.length );
	}

	removeAnswer( idx: number )
	{
		if ( idx < 2 )
			return;
		
		this.pollAnswers.splice( idx, 1 );
		this.pollAnswersIdx.splice( idx, 1 );
	}

	pollStart( )
	{
		if ( this.pollQuestion.length == 0 || this.pollAnswers.join( ).length == 0 )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: 'Fields are not correctly filled out'
			});
			return;
		}

		this.starting = true;

		this.apiService.createPoll( this.active_channel, this.pollQuestion, this.pollAnswers, this.pollMulti, this.pollDupeCheck, this.pollCaptcha )
			.then( res => {
				this.starting = false;
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				this.poll_url = this.domSanitizer.bypassSecurityTrustResourceUrl( 'https://www.strawpoll.me/embed_1/' + res.result + '/r' );
				this.poll_url_text = 'https://www.strawpoll.me/' + res.result;
				this.running = true;
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Failed to create poll, try again later.'
				});
				this.starting = false;
			});
	}

	pollClose( )
	{
		this.reset( );
		this.poll_url = null;
		this.running = false;
	}

	reset( )
	{
		this.pollQuestion = '';
		this.pollAnswers = [ '' ];
		this.pollAnswersIdx = [ 0 ];
		this.pollMulti = false;
		this.pollDupeCheck = true;
		this.pollCaptcha = true;
	}
}