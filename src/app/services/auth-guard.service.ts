import { Injectable }     from '@angular/core';
import { CanActivate, Router }    from '@angular/router';

import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class AuthGuard implements CanActivate
{
	constructor( private cookieSerivce: CookieService, private router: Router ) { }

	canActivate( )
	{
		let result = ( !!this.cookieSerivce.get( "token" ) && !!this.cookieSerivce.get( "user_id" ) );
		
		if ( result == false )
		{
			this.router.navigate( [ '/login' ] );
			return false;
		}

		return true;
	}
}