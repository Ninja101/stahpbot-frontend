// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  ENV: 'local',
  production: false,
  client_id: '',
	redirect_url: 'http://localhost:4200/login',
	api_url: 'http://api-dev.stahpbot.com/',
	cdn_url: 'http://api-dev.stahpbot.com/cdn/',
	ws_url: 'ws://api-dev.stahpbot.com:8443',
  sentry_url: 'https://xxxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxxx'
};

