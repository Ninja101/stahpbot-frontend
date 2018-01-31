/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Whitelist
{
	constructor( row: any )
	{
		for ( let idx in row )
			this[idx] = row[idx];
	}

	whitelist_id: number;
	channel: number;
	user_id: number;

	domain: string;
	timestamp: number;
	updated: number;

	user: {
		id: number;
		username: string,
		display_name: string
	}
}