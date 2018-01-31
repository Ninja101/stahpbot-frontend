import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AlertsComponent } from './dashboard/alerts.component';
import { BlacklistComponent } from './dashboard/blacklist.component';
import { CommandsComponent } from './dashboard/commands.component';
import { DonationsComponent } from './dashboard/donations.component';
import { DonationsTopComponent } from './dashboard/donations-top.component';
import { EventsComponent } from './dashboard/events.component';
import { GiveawaysComponent } from './dashboard/giveaways.component';
import { MessagesComponent } from './dashboard/messages.component';
import { PollComponent } from './dashboard/poll.component';
import { QuotesComponent } from './dashboard/quotes.component';
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

import { AlertFormComponent } from './include/alertform.component';
import { BreadcrumbComponent } from './include/breadcrumb.component';
import { DraggableComponent } from './include/draggable.component';

import { PublicCommandsComponent }  from './public/commands.component';

import { TranslatePipe } from './lang/translate.pipe';

export const APP_DECLARATIONS = [
	TranslatePipe,

	AppComponent,
	DashboardComponent,
	AlertsComponent,
	BlacklistComponent,
	CommandsComponent,
	DonationsComponent,
	DonationsTopComponent,
	EventsComponent,
	GiveawaysComponent,
	MessagesComponent,
	PollComponent,
	QuotesComponent,
	SongRequestsComponent,
	SubUsersComponent,
	UsersComponent,

	SettingsGeneralComponent,
	SettingsAlertsComponent,
	SettingsDonationsComponent,
	SettingsTimeoutsComponent,

	BotCommandsComponent,
	DownloadsComponent,

	LoginComponent,
	AuthTwitterComponent,
	AuthTwitchAlertsComponent,
	
	NotFoundComponent,

	PublicCommandsComponent,

	AlertFormComponent,
	BreadcrumbComponent,
	DraggableComponent
];
