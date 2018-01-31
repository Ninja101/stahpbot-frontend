/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export class Channel
{
    constructor( channel: string, channel_id: number )
    {
        this.name = channel.substr( 1, 1).toUpperCase( ) + channel.substr( 2 ).toLowerCase( );
        this.raw = channel;
        this.twitch_id = channel_id;
    }

    twitch_id: number;
    raw: string;
    name: string;
}