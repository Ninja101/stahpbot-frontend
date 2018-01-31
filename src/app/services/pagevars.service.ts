import { Injectable } from '@angular/core';

@Injectable( )
export class PagevarsService
{
	private pageTitle: string = "";
	private pageDesc: string = "";

	setPageTitle( newTitle: string )
	{
		this.pageTitle = newTitle;
	}

	setPageDesc( newDesc: string )
	{
		this.pageDesc = newDesc;
	}

	getPageTitle( )
	{
		return this.pageTitle;
	}

	getPageDesc( )
	{
		return this.pageDesc;
	}
}