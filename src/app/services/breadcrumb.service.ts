export class BreadcrumbService
{
	private routeFriendlyNames: any = { };

	addFriendlyNameForRoute( route: string, name: string ): void
	{
		this.routeFriendlyNames[route] = name;
	}

	getFriendlyNameForRoute( route: string ): string
	{
		var val = this.routeFriendlyNames[route];

		if ( !val )
			val = '';

		return val;
	}
}
