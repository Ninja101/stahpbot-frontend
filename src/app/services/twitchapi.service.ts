
import { Injectable } from '@angular/core';
import { Headers, Http, Jsonp, URLSearchParams } from '@angular/http';

import { sprintf } from 'sprintf-js';

@Injectable( )
export class TwitchAPIService
{
	private base_url: string;
	private headers: Headers;

	constructor( private http: Http, private jsonp: Jsonp )
	{
		this.base_url = 'https://api.twitch.tv/kraken/';
		this.headers = new Headers({
			'Accept': 'application/vnd.twitchtv.v5+json',
			'Client-ID': 'j9nth5g4zqf3q4g5gtyuk5za55019g7',
		});
	}

	getChannel( channel_id: number )
	{
		let url = this.makeUrl( 'channels/' + channel_id, false );

		return this.http
			.get( url, { headers: this.headers } )
			.map( response => response.json( ) )
			.toPromise( );
	}

	getChatters( channel: string )
	{
		if ( channel[0] == '#' )
			channel = channel.substr( 1 );

		let url = 'https://tmi.twitch.tv/group/user/' + channel + '/chatters?callback=JSONP_CALLBACK';

		return this.jsonp
			.get( url, { headers: this.headers } )
			.map( response => response.json( ).data.chatter_count )
			.toPromise( );
	}

	getStreamTitle( channel_id: number )
	{
		let url = this.makeUrl( 'channels/' + channel_id, false );

		return this.http
			.get( url, { headers: this.headers } )
			.map( response => {
				let info = response.json( );
				return info.status;
			})
			.toPromise( );
	}

	getTwitchId( username: string ): Promise<number>
	{
		let url = this.makeUrl( 'users', false, { login: username } );

		return this.http
			.get( url, { headers: this.headers } )
			.map( response => {
				let info = response.json( );
				return info.users[0]._id;
			})
			.toPromise( );
	}

	getBetterTTVBots( channel: string )
	{
		if ( channel[0] == '#' )
			channel = channel.substr( 1 );

		let url = 'https://api.betterttv.net/2/channels/' + channel;

		return this.http
			.get( url )
			.map( response => response.json( ) )
			.toPromise( );
	}

	private makeUrl( endpoint: string, jsonp?: boolean, args?: {} )
	{
		if ( !args )
			args = { };
		
		if ( jsonp )
			args['callback'] = 'JSONP_CALLBACK';

		let args_out: string[] = [];
		for ( let arg in args )
			args_out.push( encodeURIComponent( arg ) + "=" + encodeURIComponent( args[arg] ) );

		return sprintf( "%s%s?%s", this.base_url, endpoint, args_out.join( "&" ) );
	}
}