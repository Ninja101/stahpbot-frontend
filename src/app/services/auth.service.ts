
import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

import { CookieService } from 'angular2-cookie/core';

import { APIService } from './api.service';

import { Channel } from '../models/channel';
import { User } from '../models/user';

@Injectable( )
export class AuthService
{
	private authSource: Subject<User> = new Subject<User>( );
	private channelSource: Subject<Channel> = new Subject<Channel>( );
	private initSource: Subject<any> = new Subject<any>( );

	public init: any;
	public user: User;
	public channel: Channel;

	public error: string;

	constructor( private apiService: APIService, private cookieService: CookieService ) { }

	registerHandlers( onChannel: ( channel: Channel ) => void, onUser: any, onInit?: any )
	{
		this.getChannel( )
			.subscribe( ( channel ) => onChannel( channel ) );

		this.getUser( )
			.subscribe( user => onUser( user ) );

		if ( onInit )
		{
			this.getInit( )
				.subscribe( data => onInit( data ) );

			if ( this.init )
				onInit( this.init );
		}

		if ( this.channel )
			onChannel( this.channel );

		if ( this.user )
			onUser( this.user );
	}

	setChannel( channel: Channel )
	{
		this.channel = channel;
		this.cookieService.put( "channel", JSON.stringify( channel ), {
			secure: environment.production,
		});
		this.channelSource.next( channel );
	}

	getChannel( )
	{
		return this.channelSource
			.asObservable( );
	}

	setUser( user: Promise<any> )
	{
		user.then( ( res: any ) => {
			if ( res.error )
			{
				this.cookieService.remove( "token" );
				this.error = res.error;
				this.authSource.next( null );
				return;
			}

			try
			{
				this.channel = JSON.parse(
					this.cookieService.get( "channel" )
				);
			}
			catch( err )
			{
				this.channel = new Channel( res.result.user.channel, res.result.user.twitch_id );
			}

			this.init = res.result.data;
			this.user = res.result.user;

			this.authSource.next( this.user );
			this.channelSource.next( this.channel );
			this.initSource.next( this.init );
		})
		.catch( ( err: any ) => {
			this.cookieService.remove( "token" );

			this.error = 'Server unavailable';
			this.authSource.next( null );
		});

		return this.getUser( );
	}

	getUser( )
	{
		return this.authSource
			.asObservable( );
	}

	getInit( )
	{
		return this.initSource
			.asObservable( );
	}

	logout( )
	{
		this.cookieService.remove( "token" );
		this.cookieService.remove( "user_id" );

		this.apiService.authLogout( );
		this.authSource.next( null );
	}
}