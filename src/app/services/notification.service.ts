import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Subject';

import { Notification } from '../models/notification';

export class NotificationService
{
	private source: Subject<any> = new Subject<Notification>( );

	getNotifications( )
	{
		return this.source
			.asObservable( );
	}

	addNotification( notif: Notification )
	{
		this.source.next( notif );
	}
}
