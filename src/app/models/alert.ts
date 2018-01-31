/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class AlertItem
{
	id: number;
	type: string;
	locked: boolean = false;

	top: number;
	left: number;
	z_index: number;

	data: any;
	text?: string;
	image_url?: string;
}

export class Alert
{
	constructor( row?: any )
	{
		if ( !row )
			return;

		this.exists = true;

		for ( let idx in row )
		{
			if ( idx == 'items' )
			{
				this[idx] = JSON.parse( row[idx] );
				return;
			}
			
			this[idx] = row[idx];
		}
	}

	exists: boolean = false;

	alert_id: number;
	channel: number;
	user_id: number;

	name: string;
	type: string = 'subscriber';
	active: boolean = true;
	duration: number = 5;
	enter_effect: string = 'slideInDown';
	enter_effect_duration: number = 250;
	leave_effect: string = 'slideOutUp';
	leave_effect_duration: number = 250;
	width: number = 500;
	height: number = 150;

	items: AlertItem[] = [ ];
	item_files: any = { };

	new_sound: File;
	remove_sound: boolean = false;

	sound_path: string;
	sound_mimetype: string;
	sound_volume: number = 50;
	sound_tts: boolean; // Deprecated
	sound_tts_voice: string; // Deprecated
	sound_tts_volume: number; // Deprecated

	timestamp: number;
	updated: number;

	user: {
		id: number;
		username: string,
		display_name: string
	}
}