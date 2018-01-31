/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { environment } from '../../environments/environment';

import { Component, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';

import { CookieService } from 'angular2-cookie/core';

import { AlertsService } from '../services/alerts.service';
import { APIService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { PagevarsService } from '../services/pagevars.service';
import { TranslateService } from '../services/translate.service';

import { sprintf } from 'sprintf-js';

@Component({
	selector: 'sb-login',
	templateUrl: 'views/login.html',
	encapsulation: ViewEncapsulation.None,
	styleUrls: [
		'../../assets/pages/css/login.css'
	],
	animations: [
		trigger( 'flyDownUp', [
			state( 'in',
				style( { transform: 'translateY(0)' } )
			),
			transition( 'void => *', [
				style( { transform: 'translateY(-100%)' } ),
				animate( 100 )
			]),
			transition( '* => void', [
				animate( 100,
					style( { transform: 'translateY(-100%)' } )
				)
			])
		]),
		trigger( 'showHide', [
			state( 'in',
				style( { height: 'auto' } )
			),
			transition( 'void => *', [
				style( { height: '0px' } ),
				animate( 250 )
			]),
			transition( '* => void', [
				animate( 250,
					style( { height: '0px' } )
				)
			])
		])
	]
})
export class LoginComponent
{
	private client_id: string = environment.client_id;
	private scope: string[] = [ "user_read", "channel_commercial", "channel_editor", "channel_subscriptions", "channel_check_subscription" ];
	private redirect_url: string = environment.redirect_url;

	public loading: boolean = false;
	public loggingIn: boolean = false;

	public showPerms: boolean = false;

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private cookieService: CookieService,
		private pagevarsService: PagevarsService,
		private router: Router,
		private titleService: Title,
		private translateService: TranslateService
	)
	{
		breadcrumbService.addFriendlyNameForRoute( '/login', 'Login' );
		pagevarsService.setPageTitle( '' );
		titleService.setTitle( "Login - Stahpbot" );

		if ( authService.error )
		{
			this.alertsService.error({
				title: 'An error occurred',
				text: authService.error
			});
		}

		router.routerState.root.queryParams.subscribe( params => {
			let code = params['code'];

			if ( code )
			{
				this.loggingIn = true;
				this.loginTwitchResult( code );
			}
		});
	}

	loginTwitch( )
	{
		this.loading = true;
		window.location.href = sprintf(
			'https://api.twitch.tv/kraken/oauth2/authorize?response_type=code&client_id=%s&redirect_uri=%s&scope=%s',
			this.client_id,
			encodeURIComponent( this.redirect_url ),
			this.scope.join( '+' )
		);
	}

	loginTwitchResult( code: string )
	{
		this.apiService.authLogin( code )
			.then( res => {
				this.loggingIn = false;
				
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				let expires = new Date( );
				expires.setDate( expires.getDate( ) + 30 );

				this.cookieService.put( "token", res.token, {
					expires: expires,
					secure: environment.production
				});
				this.cookieService.put( "user_id", res.result.id.toString( ), {
					expires: expires,
					secure: environment.production
				});

				this.apiService.setToken( res.token, res.result.id );
				this.authService.setUser( this.apiService.getMe( ) )
					.subscribe( user => {
						this.router.navigate( [ '/' ] );
					});
			})
			.catch( err => {
				this.loggingIn = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable, try again later'
				});
				return;
			});
	}
}