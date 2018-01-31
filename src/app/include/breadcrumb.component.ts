/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BreadcrumbService } from '../services/breadcrumb.service';

@Component({
	selector: 'breadcrumb',
	template: `
		<ul class="page-breadcrumb">
			<li *ngFor="let url of _urls; let first = first; let last = last">
				<i *ngIf="first" class="icon-angle-double-right"></i>
				<a *ngIf="!last" (click)="navigateTo(url)" href="javascript:;">{{friendlyName(url)}}</a>
				<i *ngIf="!last" class="icon-angle-double-right"></i>
				<span *ngIf="last">{{friendlyName(url)}}</span>
			</li>
		</ul>
	`
})
export class BreadcrumbComponent
{
	public _urls: string[ ];

	constructor( private router: Router, private breadcrumbService: BreadcrumbService )
	{
		this._urls = new Array();
		this.router.events.subscribe((navigationEnd:NavigationEnd) => {
			this._urls.length = 0; //Fastest way to clear out array
			let url = navigationEnd.urlAfterRedirects ? navigationEnd.urlAfterRedirects : navigationEnd.url;

			if ( url.indexOf( '?' ) >= 0 )
				url = url.substr( 0, url.indexOf( '?' ) )

			this.generateBreadcrumbTrail( url );
		});
	}

	generateBreadcrumbTrail( url: string ): void
	{
		this._urls.unshift( url );
		if (url.lastIndexOf('/') > 0) {
			this.generateBreadcrumbTrail(url.substr(0, url.lastIndexOf('/')));
		}
	}

	navigateTo( url: string ): void
	{
		if ( url == '/settings' )
			url = '/settings/general';
		
		this.router.navigateByUrl( url );
	}

	friendlyName( url: string ): string
	{
		return !url ? '' : this.breadcrumbService.getFriendlyNameForRoute( url );
	}

}
