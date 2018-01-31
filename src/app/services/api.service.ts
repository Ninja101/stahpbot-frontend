
import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';

import { Alert } from '../models/alert';
import { Blacklist } from '../models/blacklist';
import { Channel } from '../models/channel';
import { Command } from '../models/command';
import { Donation } from '../models/donation';
import { Message } from '../models/message';
import { Quote } from '../models/quote';
import { SongRequest } from '../models/songrequest';
import { SubUser } from '../models/subuser';
import { User } from '../models/user';

declare var process: any;

@Injectable( )
export class APIService
{
	constructor( private http: Http ) { }

	public baseUrl = environment.api_url;

	public headers: Headers;
	private token: string;
	private user_id: number;

	setToken( token: string, user_id: number )
	{
		this.token = token;
		this.user_id = user_id;

		this.headers = new Headers( { 'x-auth-token': token, 'x-user-id': user_id } );
	}

	// Internal

	get( url: string, params: URLSearchParams, authed: boolean )
	{
		let opts = { };

		if ( params )
			opts['search'] = params;

		if ( authed )
			opts['headers'] = this.headers;

		return this.http
			.get( this.baseUrl + url, opts )
			.map( response => <any> response.json( ) )
			.toPromise( );
	}

	post( url: string, params: any, authed: boolean )
	{
		let opts = { };

		if ( authed )
			opts['headers'] = this.headers;

		return this.http
			.post( this.baseUrl + url, params, opts )
			.map( response => <any> response.json( ) )
			.toPromise( );
	}

	// Auth

	authLogin( code: string )
	{
		const endpoint = 'auth/login';

		let params = new FormData( );
		params.append( 'code', code );

		return this.post( endpoint, params, false );
	}

	authLogout( )
	{
		const endpoint = 'auth/logout';

		return this.post( endpoint, null, true );
	}

	// Auth Twitter

	authTwitter( channel: Channel )
	{
		const endpoint = 'auth/twitter';

		let params = new FormData( );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	authTwitterDisconnect( channel: Channel )
	{
		const endpoint = 'auth/twitter/disconnect';

		let params = new FormData( );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	authTwitterResult( verifier: string )
	{
		const endpoint = 'auth/twitter/result';

		let params = new FormData( );
		params.append( 'oauth_verifier', verifier );

		return this.post( endpoint, params, true );
	}

	// Auth TwitchAlerts

	authTwitchAlertsResult( channel: Channel, code: string )
	{
		const endpoint = 'auth/twitchalerts/result';

		let params = new FormData( );
		params.append( 'channel', channel.twitch_id );
		params.append( 'code', code );

		return this.post( endpoint, params, true );
	}

	// Meeeeeeee!

	getMe( )
	{
		const endpoint = 'users/me';

		return this.get( endpoint, null, true );
	}

	// Dashboard

	getDashboard( channel: Channel )
	{
		const endpoint = 'dashboard/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );

		return this.get( endpoint, params, true );
	}

	// Alerts

	getAlerts( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'alerts/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	getAlertsPublic( channel: Channel, exclude?: string )
	{
		const endpoint = 'alerts/public';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'exclude', exclude || '' );

		return this.get( endpoint, params, false );
	}

	addAlert( alert: Alert )
	{
		const endpoint = 'alerts/add';

		let params = new FormData( );
		params.append( 'channel', alert.channel );
		params.append( 'name', alert.name );
		params.append( 'type', alert.type );
		params.append( 'active', alert.active ? 1 : 0 );
		params.append( 'duration', alert.duration );
		params.append( 'enter_effect', alert.enter_effect );
		params.append( 'enter_effect_duration', alert.enter_effect_duration );
		params.append( 'leave_effect', alert.leave_effect );
		params.append( 'leave_effect_duration', alert.leave_effect_duration );
		params.append( 'width', alert.width );
		params.append( 'height', alert.height );
		params.append( 'sound_volume', alert.sound_volume );

		if ( alert.new_sound )
			params.append( 'sound_file', alert.new_sound );

		if ( alert.item_files )
		{
			for ( let idx in alert.item_files )
				params.append( 'image-' + idx, alert.item_files[idx] );
		}

		params.append( 'items', JSON.stringify( alert.items ) );

		return this.post( endpoint, params, true );
	}

	editAlert( alert: Alert )
	{
		const endpoint = 'alerts/edit';

		let params = new FormData( );
		params.append( 'alert_id', alert.alert_id );
		params.append( 'channel', alert.channel );
		params.append( 'name', alert.name );
		params.append( 'type', alert.type );
		params.append( 'active', alert.active ? 1 : 0 );
		params.append( 'duration', alert.duration );
		params.append( 'enter_effect', alert.enter_effect );
		params.append( 'enter_effect_duration', alert.enter_effect_duration );
		params.append( 'leave_effect', alert.leave_effect );
		params.append( 'leave_effect_duration', alert.leave_effect_duration );
		params.append( 'width', alert.width );
		params.append( 'height', alert.height );
		params.append( 'sound_volume', alert.sound_volume );

		if ( alert.new_sound )
			params.append( 'sound_file', alert.new_sound );
		
		params.append( 'remove_sound', alert.remove_sound ? 1 : 0 );

		if ( alert.item_files )
		{
			for ( let idx in alert.item_files )
				params.append( 'image-' + idx, alert.item_files[idx] );
		}

		params.append( 'items', JSON.stringify( alert.items ) );

		return this.post( endpoint, params, true );
	}

	deleteAlert( alert: Alert )
	{
		const endpoint = 'alerts/delete';

		let params = new FormData( );
		params.append( 'alert_id', alert.alert_id );
		params.append( 'channel', alert.channel );

		return this.post( endpoint, params, true );
	}

	deleteAlertMulti( alert_ids: string[], channel: Channel )
	{
		let endpoint = 'alerts/delete';

		let params = new FormData( );
		params.append( 'alert_ids', alert_ids.join( "," ) );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	// Blacklist

	getBlacklist( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'blacklist/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	addBlacklist( entry: Blacklist )
	{
		const endpoint = 'blacklist/add';

		let params = new FormData( );
		params.append( 'channel', entry.channel );
		params.append( 'string', entry.string );
		params.append( 'type', entry.type );
		params.append( 'length', entry.timeout_length );
		params.append( 'description', entry.description );

		return this.post( endpoint, params, true );
	}

	deleteBlacklist( entry: Blacklist )
	{
		let endpoint = 'blacklist/delete';

		let params = new FormData( );
		params.append( 'blacklist_id', entry.blacklist_id );
		params.append( 'channel', entry.channel );

		return this.post( endpoint, params, true );
	}

	deleteBlacklistMulti( blacklist_ids: string[], channel: Channel )
	{
		let endpoint = 'blacklist/delete';

		let params = new FormData( );
		params.append( 'blacklist_ids', blacklist_ids.join( "," ) );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	// Commands

	getPublicCommands( channel: string, page: number, per_page: number )
	{
		const endpoint = 'commands/public';

		let params = new URLSearchParams( );
		params.set( 'channel', channel );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	getCommands( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'commands/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	addCommand( command: Command )
	{
		const endpoint = 'commands/add';

		let params = new FormData( );
		params.append( 'channel', command.channel );
		params.append( 'command', command.command );
		params.append( 'response', command.response );
		params.append( 'format', command.format );
		params.append( 'cooldown', command.cooldown );
		params.append( 'user_level', command.user_level );
		params.append( 'visible', command.visible ? 1 : 0 );
		params.append( 'editable', command.editable ? 1 : 0 );

		return this.post( endpoint, params, true );
	}

	editCommand( command: Command )
	{
		const endpoint = 'commands/edit';

		let params = new FormData( );
		params.append( 'command_id', command.command_id );
		params.append( 'channel', command.channel );
		params.append( 'command', command.command );
		params.append( 'response', command.response );
		params.append( 'format', command.format );
		params.append( 'cooldown', command.cooldown );
		params.append( 'user_level', command.user_level );
		params.append( 'visible', command.visible ? 1 : 0 );
		params.append( 'editable', command.editable ? 1 : 0 );

		return this.post( endpoint, params, true );
	}

	deleteCommand( command: Command )
	{
		let endpoint = 'commands/delete';

		let params = new FormData( );
		params.append( 'command_id', command.command_id );
		params.append( 'channel', command.channel );

		return this.post( endpoint, params, true );
	}

	deleteCommandMulti( command_ids: string[], channel: Channel )
	{
		let endpoint = 'commands/delete';

		let params = new FormData( );
		params.append( 'command_ids', command_ids.join( ',' ) );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	// Donations

	getDonations( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'donations/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	getDonationsTop( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'donations/top';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	deleteDonation( donation: Donation )
	{
		const endpoint = 'donations/delete';

		let params = new FormData( );
		params.append( 'donation_id', donation.donation_id );
		params.append( 'channel', donation.channel );

		return this.post( endpoint, params, true );
	}

	// Events

	getEvents( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'events/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	getEventsRecent( channel: Channel, limit: number = 25 )
	{
		const endpoint = 'events/recent';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'limit', limit.toString( ) );

		return this.get( endpoint, params, true );
	}

	// Messages

	getMessages( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'messages/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	addMessage( message: Message )
	{
		const endpoint = 'messages/add';

		let params = new FormData( );
		params.append( 'type', message.type );
		params.append( 'text', message.text );
		params.append( 'interval', message.interval );
		params.append( 'only_live', message.only_live ? 1 : 0 );
		params.append( 'channel', message.channel );

		return this.post( endpoint, params, true );
	}

	editMessage( message: Message )
	{
		const endpoint = 'messages/edit';

		let params = new FormData( );
		params.append( 'message_id', message.message_id );
		params.append( 'type', message.type );
		params.append( 'text', message.text );
		params.append( 'interval', message.interval );
		params.append( 'only_live', message.only_live ? 1 : 0 );
		params.append( 'channel', message.channel );

		return this.post( endpoint, params, true );
	}

	deleteMessage( message: Message )
	{
		const endpoint = 'messages/delete';

		let params = new FormData( );
		params.append( 'message_id', message.message_id );
		params.append( 'channel', message.channel );

		return this.post( endpoint, params, true );
	}

	deleteMessageMulti( message_ids: string[], channel: Channel )
	{
		let endpoint = 'messages/delete';

		let params = new FormData( );
		params.append( 'message_ids', message_ids.join( ',' ) );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	// Poll

	createPoll( channel: Channel, text: string, answers: string[], multi: boolean, dupecheck: boolean, captcha: boolean )
	{
		const endpoint = 'poll/create';

		let params = new FormData( );
		params.append( 'channel', channel.twitch_id );
		params.append( 'title', text );
		params.append( 'options', answers );
		params.append( 'multi', multi ? '1' : '0' );
		params.append( 'dupcheck', dupecheck ? '1' : '0' );
		params.append( 'captcha', captcha ? '1' : '0' );

		return this.post( endpoint, params, true );
	}

	// Quotes

	getQuotes( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'quotes/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	addQuote( quote: Quote )
	{
		const endpoint = 'quotes/add';

		let params = new FormData( );
		params.append( 'text', quote.text );
		params.append( 'channel', quote.channel );
		
		return this.post( endpoint, params, true );
	}

	deleteQuote( quote: Quote )
	{
		const endpoint = 'quotes/delete';

		let params = new FormData( );
		params.append( 'quote_id', quote.quote_id );
		params.append( 'channel', quote.channel );

		return this.post( endpoint, params, true );
	}

	deleteQuoteMulti( quote_ids: string[], channel: Channel )
	{
		let endpoint = 'quotes/delete';

		let params = new FormData( );
		params.append( 'quote_ids', quote_ids.join( ',' ) );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	// Settings

	getSettings( channel: Channel )
	{
		const endpoint = 'settings/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );

		return this.get( endpoint, params, true );
	}

	updateSettings( channel: Channel, settings: any )
	{
		const endpoint = 'settings/update';

		let params = new FormData( );
		params.append( 'channel', channel.twitch_id );

		for ( let name in settings )
		{
			let val = settings[name];

			if ( typeof val == "boolean" )
				val = ( val ? "1" : "0" );

			params.append( name, val );
		}

		return this.post( endpoint, params, true );
	}

	// Song Requests

	getSongRequests( channel: Channel, offset_id?: number )
	{
		const endpoint = 'songrequests/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );

		if ( offset_id )
			params.set( 'offset_id', offset_id.toString( ) );

		return this.get( endpoint, params, true );
	}

	deleteSongRequest( request: SongRequest )
	{
		const endpoint = 'songrequests/delete';

		let params = new FormData( );
		params.append( 'request_id', request.request_id );
		params.append( 'channel', request.channel );

		return this.post( endpoint, params, true );
	}

	// Sub Users

	getSubUsers( page: number, per_page: number )
	{
		const endpoint = 'subusers/get';

		let params = new URLSearchParams( );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	addSubUser( user: SubUser )
	{
		const endpoint = 'subusers/add';

		let params = new FormData( );
		params.append( 'username', user.username );
		params.append( 'alerts', user.alerts ? 1 : 0 );
		params.append( 'donations', user.donations ? 1 : 0 );
		params.append( 'settings', user.settings ? 1 : 0 );
		
		return this.post( endpoint, params, true );
	}

	editSubUser( user: SubUser )
	{
		const endpoint = 'subusers/edit';

		let params = new FormData( );
		params.append( 'username', user.username );
		params.append( 'alerts', user.alerts ? 1 : 0 );
		params.append( 'donations', user.donations ? 1 : 0 );
		params.append( 'settings', user.settings ? 1 : 0 );
		
		return this.post( endpoint, params, true );
	}

	deleteSubUser( user: SubUser )
	{
		const endpoint = 'subusers/delete';

		let params = new FormData( );
		params.append( 'username', user.username );

		return this.post( endpoint, params, true );
	}

	// Users

	getUsers( page: number, per_page: number )
	{
		const endpoint = 'users/get';

		let params = new URLSearchParams( );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	addUser( user: User )
	{
		const endpoint = 'users/add';

		let params = new FormData( );
		params.append( 'twitch_id', user.twitch_id );
		params.append( 'username', user.username );
		params.append( 'active', user.active ? 1 : 0 );
		params.append( 'rank', user.rank );
		
		return this.post( endpoint, params, true );
	}

	editUser( user: User )
	{
		const endpoint = 'users/edit';

		let params = new FormData( );
		params.append( 'user_id', user.user_id );
		params.append( 'twitch_id', user.twitch_id );
		params.append( 'username', user.username );
		params.append( 'email_address', user.email_address );
		params.append( 'active', user.active ? 1 : 0 );
		params.append( 'rank', user.rank );
		
		return this.post( endpoint, params, true );
	}

	toggleUser( user: User )
	{
		const endpoint = 'users/toggle';

		let params = new FormData( );
		params.append( 'user_id', user.user_id );

		return this.post( endpoint, params, true );
	}

	deleteUser( user: User )
	{
		const endpoint = 'users/delete';

		let params = new FormData( );
		params.append( 'user_id', user.user_id );

		return this.post( endpoint, params, true );
	}

	// Whitelist

	getWhitelist( channel: Channel, page: number, per_page: number )
	{
		const endpoint = 'whitelist/get';

		let params = new URLSearchParams( );
		params.set( 'channel', channel.twitch_id.toString( ) );
		params.set( 'page', page.toString( ) );
		params.set( 'per_page', per_page.toString( ) );

		return this.get( endpoint, params, true );
	}

	addWhitelist( channel: Channel, domain: string )
	{
		const endpoint = 'whitelist/add';

		let params = new FormData( );
		params.append( 'domain', domain );
		params.append( 'channel', channel.twitch_id );

		return this.post( endpoint, params, true );
	}

	deleteWhitelist( whitelist_id: number, channel: number )
	{
		const endpoint = 'whitelist/delete';

		let params = new FormData( );
		params.append( 'whitelist_id', whitelist_id );
		params.append( 'channel', channel );

		return this.post( endpoint, params, true );
	}

	// Setters

	setCommercial( channel: Channel, duration: number )
	{
		const endpoint = 'commercial/set';

		let params = new FormData( );
		params.append( 'channel', channel.twitch_id );
		params.append( 'duration', duration );

		return this.post( endpoint, params, true );
	}

	setStreamTitle( channel: Channel, newTitle: string )
	{
		const endpoint = 'streamtitle/set';

		let params = new FormData( );
		params.append( 'channel', channel.twitch_id );
		params.append( 'title', newTitle );

		return this.post( endpoint, params, true );
	}
}