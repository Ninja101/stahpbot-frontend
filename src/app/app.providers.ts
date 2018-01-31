import { ErrorHandler } from '@angular/core';
import { RollbarHandler } from './error/handler';

import { AlertsService } from './services/alerts.service';
import { APIService } from './services/api.service';
import { AuthGuard } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { BreadcrumbService } from './services/breadcrumb.service';
import { NotificationService } from './services/notification.service';
import { PagevarsService } from './services/pagevars.service';
import { TranslateService } from './services/translate.service';
import { TwitchAPIService } from './services/twitchapi.service';
import { WebsocketService } from './services/websocket.service';

import { CookieOptions, CookieService } from 'angular2-cookie/core';

export function cookieServiceFactory( )
{
	return new CookieService( );
}

export const APP_PROVIDERS = [
	{ provide: ErrorHandler, useClass: RollbarHandler },

	AlertsService,
	AuthGuard,
	AuthService,
	APIService,
	BreadcrumbService,
	NotificationService,
	PagevarsService,
	TranslateService,
	TwitchAPIService,
	WebsocketService,

	{ provide: CookieService, useFactory: cookieServiceFactory }
];