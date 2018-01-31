/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Message
{
	constructor( row?: any )
	{
		if ( !row )
			return;

		this.exists = true;

		for ( let idx in row )
			this[idx] = row[idx];
	}

	exists: boolean = false;

	message_id: number;
	channel: number;
	user_id: number;

	type: string = 'scheduled';
	text: string = '';
	interval: number = 300;
	only_live: boolean = true;

	timestamp: number;
	updated: number;

	user: {
		id: number;
		username: string,
		display_name: string
	}
}