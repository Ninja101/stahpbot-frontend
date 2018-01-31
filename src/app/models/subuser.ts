/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class SubUser
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
	username: string = '';
	display_name: string;
	
    alerts: boolean = false;
    donations: boolean = false;
    settings: boolean = false;

	timestamp: number;
	updated: number;
	login_timestamp: number;

	exists: boolean = false;
}