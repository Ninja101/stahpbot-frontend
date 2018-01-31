/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

const permission_tags = {
	1: [ { label: 'danger', text: 'Mod' }, { label: 'success', text: 'Sub' } ],
	2: [ { label: 'danger', text: 'Mod' } ],
	3: [ { label: 'warning bg-purple', text: 'Broadcaster' } ],
	4: [ { label: 'danger', text: 'Admin' } ],
	0: [ { label: 'primary', text: 'Any' } ]
};

export class Command
{
	constructor( row?: any )
	{
		if( !row )
			return;

		this.exists = true;
		
		for ( let idx in row )
		{
			if ( idx == 'visible' )
			{
				this[idx] = row[idx] == 1 ? true : false;
				continue;
			}
			
			this[idx] = row[idx];
		}
	}

	exists: boolean = false;

	command_id: number = -1;
	channel: number = 0;
	user_id: number = 0;

	command: string = "";
	response: string = "";
	format: string = "";
	user_level: number = 0;

	timestamp: number;
	updated: number;

	visible: boolean = true;
	editable: boolean = false;
	cooldown: number = 30;

	user: {
		id: number;
		username: string,
		display_name: string
	}

	getPermissions( )
	{
		if ( this.user_level > 4 || this.user_level < 0 )
			return permission_tags[0];

		return permission_tags[this.user_level];
	}
}