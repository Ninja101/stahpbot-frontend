import { AfterViewInit, Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/core';
import { DomSanitizer, SafeStyle, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { CookieService } from 'angular2-cookie/core';

import { BreadcrumbComponent } from './include/breadcrumb.component';
import { BreadcrumbService } from './services/breadcrumb.service';
import { NotificationService } from './services/notification.service';
import { PagevarsService } from './services/pagevars.service';

import { APIService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { TranslateService } from './services/translate.service';
import { TwitchAPIService } from './services/twitchapi.service';

import { Channel } from './models/channel';
import { User } from './models/user';
import { Notification } from './models/notification';

@Component({
	animations: [
		trigger( 'slideUpDown', [
			state( 'false', style( { transform: 'translateY(0%)' } ) ),
			transition( 'true => false', [
				style( { transform: 'translateY(-100%)' } ),
				animate( 250 )
			])
		])
	],
	selector: 'sb-app',
	templateUrl: 'dashboard/layout.html',
	styleUrls: [
		'../assets/global/css/components.min.css',
		'../assets/layouts/layout/css/layout.min.css',
		'../assets/layouts/layout/css/themes/darkblue.min.css',
		'../assets/layouts/layout/css/custom.css'
	],
	encapsulation: ViewEncapsulation.None
})

export class AppComponent implements AfterViewInit
{
	@ViewChild( BreadcrumbComponent )
	public breadcrumb: BreadcrumbComponent;

	public active_channel: Channel;
	public notifications: Notification[] = [ ];
	public notifications_unread: number = 0;
	public user: User;

	public languages: any[];
	public currLanguage: any;

	public default_image: string = "//static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png";

	public donation_currency: string = 'GBP';
	public donation_current: number = 0;
	public donation_goal: number = 0;
	public donation_pct: number = 0;
	public donation_pct_style: SafeStyle;

	public donation_top: any = { };
	public donation_top_m: any = { };

	public rsidebar_hidden: boolean = true;
	public sidebar_hidden: boolean = false;

	constructor(
		private apiService: APIService,
		private authService: AuthService,
		private breadcrumbService: BreadcrumbService,
		private cookieService: CookieService,
		private domSanitizer: DomSanitizer,
		private notificationService: NotificationService,
		private pagevarsService: PagevarsService,
		private router: Router,
		private translateService: TranslateService,
		private titleService: Title,
		private twitchApiService: TwitchAPIService
	)
	{
		let token = this.cookieService.get( "token" ),
			user_id = this.cookieService.get( "user_id" );

		authService.getInit( )
			.subscribe( data => {
				this.donation_currency = data.donation.currency;
				this.donation_current = data.donation.current;
				this.donation_goal = data.donation.goal;

				this.donation_pct = Math.round( ( this.donation_current / this.donation_goal ) * 100 );
				this.donation_pct_style = domSanitizer.bypassSecurityTrustStyle( 'width:' + this.donation_pct + '%' );

				this.donation_top = data.donation.top_donor;
				this.donation_top_m = data.donation.top_donor_month;
			});

		authService.getUser( )
			.subscribe( user => {
				if ( user == null )
				{
					window.location.href = '/login';
					return;
				}

				this.user = user;
			});

		authService.getChannel( )
			.subscribe( channel => {
				this.active_channel = channel;
				this.notifications = [ ];

				this.twitchApiService.getBetterTTVBots( channel.name.toLowerCase( ) )
					.then( ( value: any ) => {
						if ( !value.bots || value.bots.length == 0 || value.bots.indexOf( "stahpbot" ) < 0 )
							this.addBotNotification( );
					})
					.catch( ( err: any ) => {
						this.addBotNotification( );
					});
			});

		notificationService.getNotifications( )
			.subscribe( notif => {
				this.notifications.push( notif );
				this.updateNotifications( );
			});

		if ( token && user_id )
		{
			apiService.setToken( token, parseInt( user_id ) );
			authService.setUser( apiService.getMe( ) );
		}

		this.languages = [
			{ display: "English", code: "en", icon: "gb" },
			//{ display: "French", code: "fr", icon: "fr" },
			//{ display: "German", code: "de", icon: "de" },
			//{ display: "Russian", code: "ru", icon: "ru" },
			{ display: "Swedish [WIP]", code: "se", icon: "se" },
		];

		let curr_language = this.cookieService.get( 'language' ) || 'en';

		this.selectLanguage( curr_language );
	}

	getViewPort( )
	{
		if ( !window || !document )
			return { width: 0, height: 0 };

		let e: any = window,
            a: string = 'inner';

		if ( !window.innerWidth )
		{
			a = 'client';
			e = document.documentElement || document.body;
		}

		return {
			width: e[a + 'Width'],
			height: e[a + 'Height']
		};
	}

	ngAfterViewInit( )
	{
		
	}

	clickedItem( )
	{
		if ( this.getViewPort( ).width >= 992 )
			return;

		if ( this.rsidebar_hidden )
			return;

		this.rsidebar_hidden = true;
	}

	toggleResponsiveSidebar( )
	{
		if ( this.getViewPort( ).width >= 992 )
			return;

		this.rsidebar_hidden = !this.rsidebar_hidden;

		let body = document.getElementsByTagName('body')[0];
		body.classList[ this.sidebar_hidden ? 'add' : 'remove' ]( 'page-sidebar-mobile-offcanvas-open' );
	}

	toggleSidebar( )
	{
		if ( this.getViewPort( ).width < 992 )
			return;

		this.sidebar_hidden = !this.sidebar_hidden;

		let body = document.getElementsByTagName('body')[0];
		body.classList[ this.sidebar_hidden ? 'add' : 'remove' ]( 'page-sidebar-closed' );
	}

	isActive( route: string )
	{
		return this.router.isActive( route, true );
	}

	getPageTitle( )
	{
		return this.pagevarsService.getPageTitle( );
	}

	getPageDesc( )
	{
		return this.pagevarsService.getPageDesc( );
	}

	selectChannel( channel: Channel )
	{
		if ( !this.user )
			return;

		if ( this.user.channels.indexOf( channel ) < 0 )
			return;

		this.authService.setChannel( channel );
	}

	// Language

	selectLanguage( code: string )
	{
		for( let lang of this.languages )
		{
			if ( lang.code == code )
			{
				this.translateService.use( code );
				this.currLanguage = lang;

				let expires = new Date( );
				expires.setDate( expires.getDate( ) + 30 );

				this.cookieService.put( 'language', code, {
					expires: expires,
					secure: true
				});
				return true;
			}
		}

		return false;
	}

	toggleDropdown( $event: MouseEvent )
	{
		$event.preventDefault( );
		$event.stopPropagation( );
	}

	// Actions

	scrollTop( )
	{
		window.scrollTo( 0, 0 );
	}

	addBotNotification( )
	{
		let notif = new Notification( );
		notif.id = -1;
		notif.icon = 'info-circle';
		notif.severity = 'info';
		notif.text = 'Stahpbot is not marked as a bot in BetterTTV. Click here to fix.';
		notif.link = 'https://manage.betterttv.net/channel';
		notif.timestamp = ( Date.now( ) / 1000 );
		notif.is_read = false;
		this.notifications.push( notif );
		this.updateNotifications( );
	}

	updateNotifications( )
	{
		this.notifications_unread = this.notifications
			.filter( ( item ) => item.is_read == false )
			.length;
	}

	markNotificationsRead( )
	{
		for ( let notif of this.notifications )
			notif.is_read = true;
		
		this.updateNotifications( );
	}

	userLogout( )
	{
		this.authService.logout( );
	}
}