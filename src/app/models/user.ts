/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Channel } from './channel';

export class User
{
	constructor( row?: any )
	{
		if ( !row )
			return;

		this.exists = true;

		for ( let idx in row )
			this[idx] = row[idx];
	}

	user_id: number;
	twitch_id: number;
	username: string = '';
	display_name: string;
	email_address: string = '';
	channel: string;
	active: boolean = true;

	twitch_image: string;

	channels: Channel[];
	rank: string = 'user';
	token: string;

	timestamp: number;
	updated: number;
	login_timestamp: number;

	exists: boolean = false;
}