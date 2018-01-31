import * as io from 'socket.io-client';

import { environment } from '../../environments/environment';

export class WebsocketService
{
	private socket: any = null;

	public authed: boolean = false;
	public channels: string[] = [ ];

	connect( channel_id: number, token: string, user_id: number )
	{
		if ( this.socket )
		{
			this.socket.close( );
			this.socket = null;
		}

		let socket = io.connect( environment.ws_url );
		console.log( "[WS] Connecting to", environment.ws_url );

		socket.on( 'error', function( err: any )
		{
			console.log( "[WS] Error occurred", err );
		});

		socket.on( 'disconnect', function( )
		{
			console.log( "[WS] Disconnected" );
		})

		socket.on( 'connect', function( )
		{
			console.log( "[WS] Connected, authenticating..." );
			this.emit( 'join', channel_id, token, user_id );
		});

		socket.on( 'authenticated', ( data: any ) =>
		{
			console.log( "[WS] Authenticated on", data.info );
			
			this.authed = true;
			this.channels = data.info;
		});

		this.socket = socket;
	}

	on( event: string, func: any )
	{
		if ( !this.socket )
			return false;

		this.socket.on( event, func );
	}

	send( event: string, ...args: any[] )
	{
		if ( !this.socket )
			return false;

		this.socket.emit.apply( this.socket, [ event ].concat( args ) );
		return true;
	}
}