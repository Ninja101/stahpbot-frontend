import { Routes } from '@angular/router';

import { AuthGuard } from './services/auth-guard.service';

import { DashboardComponent }  from './dashboard/dashboard.component';
import { AlertsComponent } from './dashboard/alerts.component';
import { BlacklistComponent }  from './dashboard/blacklist.component';
import { CommandsComponent }  from './dashboard/commands.component';
import { DonationsComponent }  from './dashboard/donations.component';
import { DonationsTopComponent }  from './dashboard/donations-top.component';
import { EventsComponent } from './dashboard/events.component';
import { GiveawaysComponent } from './dashboard/giveaways.component';
import { MessagesComponent }  from './dashboard/messages.component';
import { PollComponent } from './dashboard/poll.component';
import { QuotesComponent }  from './dashboard/quotes.component';
import { SongRequestsComponent } from './dashboard/songrequests.component';
import { SubUsersComponent } from './dashboard/subusers.component';
import { UsersComponent } from './dashboard/users.component';

import { SettingsGeneralComponent } from './dashboard/settings/general.component';
import { SettingsAlertsComponent } from './dashboard/settings/alerts.component';
import { SettingsDonationsComponent } from './dashboard/settings/donations.component';
import { SettingsTimeoutsComponent } from './dashboard/settings/timeouts.component';

import { BotCommandsComponent } from './dashboard/misc/botcommands.component';
import { DownloadsComponent } from './dashboard/misc/downloads.component';

import { AuthTwitterComponent } from './dashboard/auth/twitter.component';
import { AuthTwitchAlertsComponent } from './dashboard/auth/twitchalerts.component';
import { LoginComponent } from './dashboard/login.component';

import { NotFoundComponent }  from './error/notfound.component';

import { PublicCommandsComponent }  from './public/commands.component';

export const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'alerts',
		component: AlertsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'blacklist',
		component: BlacklistComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'commands',
		component: CommandsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'commands/bot',
		component: BotCommandsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'commands/:channel',
		component: PublicCommandsComponent
	},
	{
		path: 'donations',
		component: DonationsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'donations/top',
		component: DonationsTopComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'downloads',
		component: DownloadsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'events',
		component: EventsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'giveaways',
		component: GiveawaysComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'messages',
		component: MessagesComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'poll',
		component: PollComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'quotes',
		component: QuotesComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'settings/general',
		component: SettingsGeneralComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'settings/alerts',
		component: SettingsAlertsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'settings/donations',
		component: SettingsDonationsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'settings/timeouts',
		component: SettingsTimeoutsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'songrequests',
		component: SongRequestsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'subusers',
		component: SubUsersComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'users',
		component: UsersComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'auth/twitter',
		component: AuthTwitterComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: 'auth/twitchalerts',
		component: AuthTwitchAlertsComponent,
		canActivate: [ AuthGuard ]
	},
	{
		path: '**',
		component: NotFoundComponent
	}
];