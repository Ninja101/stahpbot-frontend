
import { Injectable, Inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Dictionary } from '../lang/translate';

@Injectable( )
export class TranslateService
{
	private _currentLang: string;
	private _translations: any;

	public get currentLang( )
	{
		return this._currentLang;
	}
	
	constructor(
		private domSanitizer: DomSanitizer,
	)
	{
		this._translations = Dictionary;
	}

	public use( lang: string ): void
	{
		this._currentLang = lang;
	}

	private translate( key: string ): string
	{
		let translation = key;

		if ( this._translations[this.currentLang] && this._translations[this.currentLang][key] )
			return this._translations[this.currentLang][key];

		return translation;
	}

	public instant( key: string ): string
	{
		return this.translate( key ); 
	}

	public instant_html( key: string ): SafeHtml
	{
		return this.domSanitizer.bypassSecurityTrustHtml( this.translate( key ) ); 
	}
}