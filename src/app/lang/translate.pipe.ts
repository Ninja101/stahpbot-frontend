/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '../services/translate.service';

@Pipe({
	name: 'translate',
	pure: false
})
export class TranslatePipe implements PipeTransform
{
	constructor( private _translate: TranslateService ) { }

	transform( value: string, args?: any[] ): any
	{
		if ( !value ) return;
		return this._translate.instant( value );
	}
}