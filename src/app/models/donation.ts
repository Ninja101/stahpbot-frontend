/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Donation
{
	constructor( row: any )
	{
		for ( let idx in row )
			this[idx] = row[idx];
	}

	donation_id: number;
	channel: number;

	nickname: string;
	sender_email: string;
	amount: number;
	currency: string;
	message: string;

	timestamp: number;

	completed: boolean;
	reversed: boolean;

	processor: string;
	gateway_id: string;
	transaction_id: string;
}