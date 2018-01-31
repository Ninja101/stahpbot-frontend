/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import * as Raven from 'raven-js';

import { environment } from '../../environments/environment';

import { ErrorHandler, Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from '../services/auth.service';

@Injectable( )
export class RollbarHandler implements ErrorHandler
{
	constructor( private authService: AuthService, private http: Http )
	{
		Raven.config( environment.sentry_url, { environment: environment.ENV } )
			.install( );

		authService.getUser( )
			.subscribe( user => {
				if ( !user )
					return;
				
				Raven.setUserContext({
					id: user.user_id.toString( ),
					username: user.username,
					email: user.email_address
				});
			});
	}

	handleError( error: any )
	{
		Raven.captureException( error.originalError );
		if ( !environment.production )
			console.warn( '[Stahpbot]', error );
	}
}