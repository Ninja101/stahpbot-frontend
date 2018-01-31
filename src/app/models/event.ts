/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Event
{
	constructor( row: any )
	{
		for ( let idx in row )
			this[idx] = row[idx];

		this.now = ( Date.now( ) / 1000 );
	}
	
	channel_id: number;
	text: string;
	icon: string;
	colour: string;
	timestamp: number;

	private now: number;

	getTimeAgo( )
	{
		if ( ( this.now - this.timestamp ) < 60 )
			return 'just now';

		var seconds = ( this.now - this.timestamp );
		var d = Math.floor( seconds / 86400 );
		seconds -= d * 86400;
		var h = Math.floor( seconds / 3600 );
		seconds -= h * 3600;
		var m = Math.floor( seconds / 60 );
		seconds -= m * 60;
		var s = Math.floor( seconds );

		let out = { num: s, type: 'sec' };
		
		if ( d > 0 )
		{
			out.num = d;
			out.type = "day";
		}
		else if ( h > 0 )
		{
			out.num = h;
			out.type = "hour";
		}
		else if ( m > 0 )
		{
			out.num = m;
			out.type = "min";
		}

		return ( out.num + " " + out.type + ( out.num > 1 ? 's' : '' ) );
	}
}