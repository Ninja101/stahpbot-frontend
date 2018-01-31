/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Quote
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

	quote_id: number;
	channel: number;
	user_id: number;

	text: string;
	timestamp: number;

	user: {
		id: number;
		username: string,
		display_name: string
	}
}