/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Blacklist
{
	constructor( row?: any )
	{
		if ( !row )
			return;
		
		for ( let idx in row )
			this[idx] = row[idx];
	}

	blacklist_id: number;
	channel: number;
	user_id: number;

	type: string = 'find';
	string: string = '';
	description: string = '';
	timeout_length: number = 30;

	timestamp: number;
	updated: number;

	user: {
		id: number;
		username: string,
		display_name: string
	}
}