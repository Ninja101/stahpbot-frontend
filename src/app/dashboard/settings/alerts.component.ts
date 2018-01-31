/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { animate, Component, state, style, transition, trigger } from '@angular/core';
import { DomSanitizer, SafeStyle, Title } from '@angular/platform-browser';

import { AlertsService } from '../../services/alerts.service';
import { APIService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { PagevarsService } from '../../services/pagevars.service';
import { TranslateService } from '../../services/translate.service';

import { Alert } from '../../models/alert';
import { Channel } from '../../models/channel';
import { User } from '../../models/user';

@Component({
	selector: 'sb-settings-alerts',
	templateUrl: '../views/settings/alerts.html',
	styleUrls: [
		'events.css'
	],
	animations: [
		trigger( 'btnState', [
			state( 'update', style( { opacity: 1 } ) ),
			state( 'error', style( { opacity: 1 } ) ),
			state( 'updated', style( { opacity: 1 } ) ),
			transition( 'update => error, update => updated, updated => update', [
				animate( 100, style( { opacity: 0 } ) ),
				animate( 250, style( { opacity: 1 } ) )
			])
		])
	]
})
export class SettingsAlertsComponent
{
	public settings: any = { };
	public original: any = { };
	public updating: boolean = false;
	public updated: boolean = false;
	public not_allowed: boolean = false;

	private active_channel: Channel;
	private user: User;

	public alert_width: number = 0;
	public alert_height: number = 0;
	public alert_url: string = '';
	public event_url: string = '';

	public validFonts: string[] = [ 'Oswald', 'Roboto Slab', 'Josefin Slab', 'Bevan', 'Kreon', 'Ubuntu' ];
	public validVoices: string[] = [
		'US English Female',
		'UK English Female',
		'UK English Male',
		'French Female',
		'Deutsch Female',
		'Italian Female',
		'Spanish Female',
		'Danish Female',
		'Swedish Female',
		'Russian Female'
	];
	public entranceEffect: string[] = [
		'slideInUp',
		'slideInDown',
		'slideInLeft',
		'slideInRight',
	];
	public exitEffect: string[] = [
		'slideOutUp',
		'slideOutDown',
		'slideOutLeft',
		'slideOutRight',
	];

	public styles: any = { };

	public translate: any = {
		'slideInUp': 'Slide Up',
		'slideInDown': 'Slide Down',
		'slideInLeft': 'Slide Left',
		'slideInRight': 'Slide Right',

		'slideOutUp': 'Slide Up',
		'slideOutDown': 'Slide Down',
		'slideOutLeft': 'Slide Left',
		'slideOutRight': 'Slide Right',
	};

	public alertUrl = {
		'bits': true,
		'donation': true,
		'follower': true,
		'host': true,
		'subscriber': true,
		'transparent': true,
	};

	public alertEventUrl = {
		'bits': true,
		'donation': true,
		'follower': true,
		'host': true,
		'subscriber': true,
		'transparent': true,
	};

	constructor(
		private alertsService: AlertsService,
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private domSanitizer: DomSanitizer,
		private pagevarsService: PagevarsService,
		private titleService: Title,
		private translateService: TranslateService
	)
	{
		breadcrumbService.addFriendlyNameForRoute( '/settings', 'Settings' );
		breadcrumbService.addFriendlyNameForRoute( '/settings/alerts', 'Alerts' );
		pagevarsService.setPageTitle( "Alert Settings" );
		titleService.setTitle( "Alert Settings - Stahpbot" );

		authService.registerHandlers(
			this.onChannelUpdate.bind( this ),
			this.onUserUpdate.bind( this )
		);

		for ( let font of this.validFonts )
			this.styles[font] = domSanitizer.bypassSecurityTrustStyle( 'font-family: "' + font + '";' );
	}

	onChannelUpdate( channel: Channel )
	{
		this.active_channel = channel;

		this.apiService.getSettings( channel )
			.then( response => {
				if ( response.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: response.error
					});

					if ( response.not_allowed )
						this.not_allowed = true;
					
					return;
				}

				for ( let name in response.result )
				{
					let val = response.result[name];
					
					if ( false == isNaN( parseInt( val ) ) )
						val = parseInt( val );

					this.settings[name] = val;
					this.original[name] = val;
				}

				this.updateExample( );
			})
			.catch( err => {
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});

		this.updateAlertUrl( );
		this.updateEventUrl( );
	}

	onUserUpdate( user: User )
	{
		this.user = user;
	}

	getHelpText( setting: string )
	{
		return this.translateService.instant( 'setting.help.' + setting );
	}

	updateSettings( )
	{
		let changed = { };

		for ( let name in this.settings )
		{
			if ( this.settings[name] != this.original[name] )
				changed[name] = this.settings[name];
		}

		if ( Object.keys( changed ).length == 0 )
			return;

		this.updating = true;

		this.apiService.updateSettings( this.active_channel, changed )
			.then( res => {
				this.updating = false;
				if ( res.error )
				{
					this.alertsService.error({
						title: 'An error occurred',
						text: res.error
					});
					return;
				}

				this.onChannelUpdate( this.active_channel );

				this.updated = true;
				setTimeout( ( ) => this.updated = false, 2000 );
			})
			.catch( err => {
				this.updating = false;
				this.alertsService.error({
					title: 'An error occurred',
					text: 'Server unavailable'
				});
			});
	}

	public exampleStyle: SafeStyle;
	public exampleEventStyle: SafeStyle;
	public exampleLatestStyle: SafeStyle;
	public exampleTextStyle: SafeStyle;
	public exampleSubStyle: SafeStyle;
	public exampleAdding: boolean = false;
	public exampleEvents: any[] = [
		{ name: 'ExampleNameeeeeeeeeeeeeeeeeeeeeeeee', type: 'SUB', hide: false },
		{ name: 'ExampleName', type: 'RE-SUB x11', hide: false },
		{ name: 'ExampleName', type: '$10.00', hide: false },
		{ name: 'ExampleChannel', type: 'HOST', hide: false },
		{ name: 'ExampleChannel', type: 'HOST', hide: false },
		{ name: 'ExampleNameeeeeeeeeeeeeeeeeeeeeeeee', type: 'SUB', hide: false },
		{ name: 'ExampleName', type: 'RE-SUB x11', hide: false },
		{ name: 'ExampleName', type: '$10.00', hide: false },
		{ name: 'ExampleChannel', type: 'HOST', hide: false },
		{ name: 'ExampleChannel', type: 'HOST', hide: false }
	];
	public exampleTypes: string[] = [ 'SUB', 'RE-SUB', 'RE-SUB x999', '$5.00', 'HOST' ];

	updateExample( )
	{
		setTimeout( ( ) => {
			let width = parseInt( this.settings.alert_event_width ),
				height = parseInt( this.settings.alert_event_height ),
				font = this.settings.alert_event_font,
				bg_color = this.settings.alert_event_background,
				color = this.settings.alert_event_colour,
				stroke_width = parseInt( this.settings.alert_event_stroke_width ),
				stroke_color = this.settings.alert_event_stroke_colour,
				latest_bg = this.settings.alert_event_latest_background,
				latest_color = this.settings.alert_event_latest_colour,
				latest_stroke_width = parseInt( this.settings.alert_event_latest_stroke_width ),
				latest_stroke_color = this.settings.alert_event_latest_stroke_colour;

			let color_re = /^#[0-9a-f]{3,6}$/i;

			if ( this.exampleEvents.length > this.settings.alert_event_maximum )
				this.exampleEvents = this.exampleEvents.splice( this.settings.alert_event_maximum );

			if (
				isNaN( width ) ||
				isNaN( height ) ||
				isNaN( stroke_width ) ||
				isNaN( latest_stroke_width ) ||
				this.validFonts.indexOf( font ) < 0 ||
				false == bg_color.match( color_re ) ||
				false == color.match( color_re ) ||
				false == stroke_color.match( color_re ) ||
				false == latest_bg.match( color_re ) ||
				false == latest_color.match( color_re ) ||
				false == latest_stroke_color.match( color_re )
			)
			{
				return;
			}

			let maximum = parseInt( this.settings.alert_event_maximum ),
				eventHeight = Math.floor( height / Math.max( maximum, 1 ) ) - 10;

			this.exampleStyle = this.domSanitizer.bypassSecurityTrustStyle(`
				width: ${ width }px;
				height: ${ height }px;
				font-family: "${ font }";
			`);

			this.exampleEventStyle = this.domSanitizer.bypassSecurityTrustStyle(`
				background-color: ${ bg_color };
				color: ${ color };
				height: ${ eventHeight }px;
				text-shadow:
					-${ stroke_width }px -${ stroke_width }px 0 ${ stroke_color },  
					${ stroke_width }px -${ stroke_width }px 0 ${ stroke_color },
					-${ stroke_width }px ${ stroke_width }px 0 ${ stroke_color },
					${ stroke_width }px ${ stroke_width }px 0 ${ stroke_color };
			`);

			this.exampleLatestStyle = this.domSanitizer.bypassSecurityTrustStyle(`
				background-color: ${ latest_bg };
				color: ${ latest_color };
				height: ${ eventHeight }px;
				text-shadow:
					-${ latest_stroke_width }px -${ latest_stroke_width }px 0 ${ latest_stroke_color },  
					${ latest_stroke_width }px -${ latest_stroke_width }px 0 ${ latest_stroke_color },
					-${ latest_stroke_width }px ${ latest_stroke_width }px 0 ${ latest_stroke_color },
					${ latest_stroke_width }px ${ latest_stroke_width }px 0 ${ latest_stroke_color };
			`);
		}, 100 );
	}

	addExample( )
	{
		if ( this.exampleAdding )
			return;

		this.exampleAdding = true;

		let maximum = this.settings.alert_event_maximum,
			prepend = ( this.settings.alert_event_direction == 'top' ),
			type_idx = Math.floor( Math.random( ) * this.exampleTypes.length );

		if ( this.exampleEvents.length >= maximum )
		{
			let idx = ( prepend ? ( this.exampleEvents.length - 1 ) : 0 );

			if ( !prepend )
			{
				this.exampleEvents[idx].hide = true;

				setTimeout( ( ) => {
					this.exampleEvents.shift( );
				}, 500 );
			}
			else
			{
				this.exampleEvents.pop( );
			}
		}

		let event = { name: 'ExampleName', type: this.exampleTypes[type_idx], hide: false };
		this.exampleEvents[ prepend ? 'unshift' : 'push' ]( event );
		
		setTimeout( ( ) => { this.exampleAdding = false; }, 1000 );
	}

	// Urls

	getDimensions( exclude: string[] )
	{
		this.apiService.getAlertsPublic( this.active_channel, exclude.join( ',' ) )
			.then( res => {
				let max_w = 0,
					max_h = 0;
				
				for ( let alert of res.result )
				{
					if ( alert.width > max_w )
						max_w = alert.width;

					if ( alert.height > max_h )
						max_h = alert.height;
				}

				this.alert_height = max_h;
				this.alert_width = max_w;
			});
	}

	updateAlertUrl( passive?: boolean )
	{
		if ( !this.active_channel )
			return '';

		let base = 'https://alerts.stahpbot.com/' + this.active_channel.twitch_id,
			args:  string[] = [ ],
			params: any = { };

		for ( let idx in this.alertUrl )
		{
			if ( this.alertUrl[idx] === false )
			{
				if ( idx == 'transparent' )
				{
					params['transparent'] = '0';
					continue;
				}

				args.push( idx );
			}
		}

		if ( !passive )
			this.getDimensions( args );

		if ( args.length > 0 )
			params['exclude'] = args.join( ',' );

		let qs = '?';

		for ( let k in params )
			qs += ( k + '=' + params[k] ) + '&';

		this.alert_url = ( base + qs.substr( 0, qs.length - 1 ) );
	}

	updateEventUrl( )
	{
		if ( !this.active_channel )
			return '';

		let base = 'https://alerts.stahpbot.com/events/' + this.active_channel.twitch_id,
			args: string[] = [ ],
			params: any = { };

		for ( let idx in this.alertEventUrl )
		{
			if ( this.alertEventUrl[idx] === false )
			{
				if ( idx == 'transparent' )
				{
					params['transparent'] = '0';
					continue;
				}

				args.push( idx );
			}
		}

		if ( args.length > 0 )
			params['exclude'] = args.join( ',' );

		let qs = '?';

		for ( let k in params )
			qs += ( k + '=' + params[k] ) + '&';

		this.event_url = base + qs.substr( 0, qs.length - 1 );
	}
}