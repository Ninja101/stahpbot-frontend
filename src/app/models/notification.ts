/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Notification
{
	constructor( )
	{
		this.now = ( Date.now( ) / 1000 );
	}

	id: number;
	text: string;
	link: string;
	timestamp: number;

	icon: string;
	severity: string;

	is_read: boolean;

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
		
		if ( d > 0 )
			return d + " days ";
		if ( h > 0 )
			return h + " hours";
		if ( m > 0 )
			return m + " mins";
		return s + " secs";
	}
}