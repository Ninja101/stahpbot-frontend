/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { AlertsService } from '../../services/alerts.service';
import { APIService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

import { Channel } from '../../models/channel';
import { User } from '../../models/user';

@Component({
	selector: 'sb-auth-twitchalerts',
	templateUrl: 'auth.html',
	styleUrls: [
		'../../../assets/pages/css/login.css'
	],
})
export class AuthTwitchAlertsComponent
{
	public loggingIn: boolean = false;
	public service: string = "TwitchAlerts";

	private active_channel: Channel;
	private user: User;

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private router: Router,
		private titleService: Title
	)
	{
		titleService.setTitle( "TwitchAlerts - Stahpbot" );
		
		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);
	}

	onChannelUpdate( channel: Channel )
	{
		this.active_channel = channel;

		this.router.routerState.root.queryParams.subscribe( params => {
			let code = params['code'];

			if ( code )
			{
				this.loggingIn = true;
				this.authTwitchAlertsResult( code );
			}
			else
			{
				this.router.navigate( [ '/settings/donations' ] );
			}
		});
	}

	onUserUpdate( user: User )
	{
		this.user = user;
	}

	authTwitchAlertsResult( code: string )
	{
		this.apiService.authTwitchAlertsResult( this.active_channel, code )
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

				this.router.navigate( [ '/settings/donations' ] );
			})
			.catch( err => {
				this.loggingIn = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable, try again later.'
				});
			});
	}
}