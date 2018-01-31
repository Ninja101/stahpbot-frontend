/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class SongRequest
{
	constructor( row: any )
	{
		for ( let idx in row )
			this[idx] = row[idx];
	}

	request_id: number;
	channel: number;

	url: string;
	title: string;
	duration: number;
	username: string;

	timestamp: number;

	playing: boolean = false;
	state: number = -1;
}