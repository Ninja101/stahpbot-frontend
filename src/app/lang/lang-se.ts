/* Copyright (c) Ninja101 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
*/

export const LANG_SE_NAME = 'se';

export const LANG_SE_TRANS = {
	'channel_select': 'Select Channel',

	'header.settings': 'Settings',
	'header.logout': 'Log Out',

	'footer.support': 'Support',
	'footer.terms': 'Terms of Service',
	'footer.privacy': 'Privacy Policy',

	'auth.login': 'Login with Twitch',
	'auth.redirect': 'Redirecting...',
	'auth.process': 'Logging in...',

	'sidebar.dashboard': 'Dashboard',
	'sidebar.alerts': 'Alerts',
	'sidebar.commands': 'Custom Commands',
	'sidebar.messages': 'Custom Messages',
	'sidebar.donations': 'Donations',
	'sidebar.events': 'Event Log',
	'sidebar.songrequests': 'Song Requests',
	'sidebar.blacklist': 'Banned Phrases',
	'sidebar.giveaways': 'Giveaways',
	'sidebar.poll': 'Poll',
	'sidebar.quotes': 'Quotes',
	'sidebar.settings_general': 'General',
	'sidebar.settings_alerts': 'Alerts',
	'sidebar.settings_donations': 'Donations',
	'sidebar.settings_timeouts': 'Timeouts',
	'sidebar.bot_commands': 'Bot Commands',
	'sidebar.downloads': 'Downloads',
	'sidebar.whitelist': 'URL Whitelist',
	'sidebar.sub-users': 'Sub Users',
	'sidebar.users': 'Users',
	'sidebar.donate': 'Donate to Stahpbot',

	'button.add': 'Add',
	'button.clear_selection': 'Clear Selection',
	'button.delete': 'Delete',
	'button.delete_selected': 'Delete Selected',
	'button.edit': 'Edit',

	'button.settings_update': 'Update Settings',
	'button.settings_updated': 'Settings Updated',

	// -------------
	// PAGE SPECIFIC
	// -------------

	'alerts.add': 'Add Alert',
	'blacklist.add': 'Add Entry',
	'commands.add': 'Add Custom Command',
	'messages.add': 'Add Custom Message',
	'quotes.add': 'Add Quote',
	'subusers.add': 'Add Sub-User',

	'dashboard.today': 'Today',
	'dashboard.now': 'Now',

	'dashboard.subscribers': 'Subscribers',
	'dashboard.timeouts': 'Timeouts',
	'dashboard.messages': 'Messages',
	'dashboard.chatters': 'Chatters',
	'dashboard.bot_stats': 'Bot Stats',
	'dashboard.bot_stats.uptime': 'Uptime',
	'dashboard.bot_stats.load': 'Load',
	'dashboard.bot_stats.messages': 'Messages/sec',

	'dashboard.action.success': 'Action completed',
	'dashboard.action.failed': 'Action failed',

	'dashboard.stream_title': 'Stream Title',
	'dashboard.stream_title.update': 'Update Title',
	'dashboard.stream_title.updating': 'Updating Title...',

	'dashboard.commercial': 'Commercial',
	'dashboard.commercial.run': 'Run Commercial',
	'dashboard.commercial.running': 'Running Commercial...',

	'dashboard.manage_alerts': 'Manage Alerts',
	'dashboard.manage_alerts.test_resubscriber': 'Test Re-subscriber',
	'dashboard.manage_alerts.test_subscriber': 'Test Subscriber',
	'dashboard.manage_alerts.test_donation': 'Test Donation',
	'dashboard.manage_alerts.silence_alert': 'Silence Current Alert',
	'dashboard.manage_alerts.cancel_alert': 'Cancel Current Alert',

	'dashboard.twitch_chat': 'Twitch Chat',
	'dashboard.recent_events': 'Recent Events',

	// -------------
	//    SETTINGS
	// -------------

	// Settings - General
	'setting.help.active': 'If unchecked, the bot will be silenced and will ignore all messages in your channel',
	'setting.help.commands_enabled': 'If unchecked, the bot will still handle events however commands (including custom commands) will be disabled',
	'setting.help.bits_announce': 'If checked, the bot will announce in chat when a bits donation is received',
	'setting.help.subscriber_announce': 'If checked, the bot will send an announcement in chat when a viewer subscribes. If you have not specified a custom message for subscribers, the default message will be sent',

	'setting.help.lastfm_active': 'If checked, the specified Last.FM username will be used in the output of the !song command',
	'setting.help.lastfm_user': 'Your Last.FM username for use with the !song command',
	'setting.help.twitter_name': 'If you connect your Twitter account, the bot can output new tweets to chat',

	'setting.help.keyword_active': 'If checked, giveaways will be enabled in chat and on the website',
	'setting.help.keyword_duration': 'If you use the !keyword command to start a keyword, this duration will be used to end the keyword',
	'setting.help.keyword_win_interval': 'Minimum time someone can win a keyword if other entrants are available to pick from',
	'setting.help.keyword_sub_entries': 'Number of entries put into the entrant pool for channel subscribers',

	'setting.help.mod_streamtitle': 'If checked, moderators can use !title to set your stream title',
	'setting.help.subcmd_enabled': 'If enabled, subscribers, moderators and the broadcaster can use !subs command to see your current subscriber count',

	// Settings - Alerts
	'setting.help.alert_bits': 'If checked, alerts will be sent for bit donations',
	'setting.help.alert_donations': 'If checked, alerts will be sent for donations',
	'setting.help.alert_followers': 'If checked, alerts will be sent for new followers',
	'setting.help.alert_host': 'If checked, alerts will be sent when a channel hosts you',
	'setting.help.alert_subscribers': 'If checked, alerts will be sent for subscribers',

	'setting.help.alert_event_direction': 'Choose if new events are added to the top or bottom of the event list',
	'setting.help.alert_event_maximum': 'Maximum number of events to show. Minimum: 3, Maximum: 10',
	'setting.help.alert_event_width': 'Width of the events page',
	'setting.help.alert_event_height': 'Height of the events page',
	'setting.help.alert_event_font': 'Font to use in the events page',
	'setting.help.alert_event_latest_background': 'Background colour of latest event',
	'setting.help.alert_event_latest_colour': 'Text colour of latest event',
	'setting.help.alert_event_background': 'Background colour of events',
	'setting.help.alert_event_colour': 'Text colour of events',

	'setting.help.alert_donations_tts': 'Enable Text-to-Speech for messages on donation alerts',
	'setting.help.alert_donations_tts_voice': 'Voice to use for Text-to-Speech',
	'setting.help.alert_donations_tts_volume': 'Volume of the Text-to-Speech voice',

	// Settings - Donations
	'setting.help.donation_enabled': 'If unchecked, donations through Stahpbot will be disabled, or donations through third-party systems will be ignored',
	'setting.help.donation_chat': 'If checked, donations will be output in chat. You can set a custom message for donations in "Custom Messages"',
	'setting.help.alert_message_length': 'Maximum number of characters to accept for donations, and to output in chat or alerts',

	'setting.help.donation_enabled_stahpbot': 'If checked, donations will be accepted via Stahpbot Donations',
	'setting.help.donation_email': 'Your PayPal email address donations will be sent to',
	'setting.help.donation_preferred': 'Currency to use when accepting donations',
	'setting.help.donation_minimum': 'Minimum donation amount to accept',
	'setting.help.donation_note': 'Note to show users on the your donate page',

	'setting.help.imraising_apikey': 'If provided, Stahpbot will integrate with ImRaising.tv to show donations in chat or in alerts. You can find this API Key in ImRaising settings',

	'setting.help.streamtip_clientid': 'If provided, Stahpbot will integrate with StreamTip to show donations in chat or in alerts. You can find these details in StreamTip settings',
	'setting.help.streamtip_accesstoken': 'If provided, Stahpbot will integrate with StreamTip to show donations in chat or in alerts. You can find these details in StreamTip settings',

	// Settings - Timeouts
	'setting.help.timeout_enabled': 'If checked, Stahpbot will perform timeouts according the specified rules. If unchecked, no timeouts will be made by the bot',
	'setting.help.log_moderator_actions': 'If checked, moderator timeouts, bans and unbans will be logged into the Event Log',
	'setting.help.timeout_notify': 'If checked, Stahpbot will write in chat explaining why the user was timed out. Will only output once per 30 seconds at maximum',
	'setting.help.timeout_subimmunity': 'If checked, subscribers will never be timed out by the bot',

	'setting.help.timeout_urls': 'If checked, users who post non-whitelisted links will be timed out',
	'setting.help.timeout_urls_subimmunity': 'If checked, subscribers will always be allowed to post links',
	'setting.help.timeout_urls_length': 'Timeout duration when timing out users for posting links',

	'setting.help.timeout_emotes': 'If checked, users who post emotes exceeding the threshold will be timed out',
	'setting.help.timeout_emotes_limit': 'If enabled and the number of emotes exceeds this number, the user will be timed out',
	'setting.help.timeout_emotes_length': 'Timeout duration when timing out users for posting too many emotes',

	'setting.help.timeout_symbols': 'If checked, users posting symbols that exceeds the threshold will be timed out. Note: This may timeout for non-English alphabets',
	'setting.help.timeout_symbols_limit': 'If enabled and the number of symbols exceeds this number, the user will be timed out',
	'setting.help.timeout_symbols_length': 'Timeout duration when timing out users for posting too many symbols',

	'setting.help.timeout_zalgo': 'If checked, users posting zalgo characters (characters that flood onto lines surrounding their message) will be timed out',
	'setting.help.timeout_zalgo_limit': 'Threshold for detecting zalgo characters, if too low it may be susceptical of false-positives',
	'setting.help.timeout_zalgo_length': 'Timeout duration when timing out users for posting zalgo characters',

	// -------------
	// HELP TOOLTIPS
	// -------------

	'help.alert.type': 'Choose an event this alert will be triggered by',
	'help.alert.name': 'Choose a name for this alert',
	'help.alert.active': 'If inactive, the alert will not be included in rotation on alert page',
	'help.alert.sound': 'If a file is given, it will be played when the alert is displayed',
	'help.alert.sound_volume': 'Volume for the specified sound file',
	'help.alert.duration': 'How long the alert will remain after the entrance effect before the exit animation begins',
	'help.alert.enter_effect': 'Effect that brings the alert into view',
	'help.alert.leave_effect': 'Effect that takes the alert out of view',
	'help.alert.editor': 'The editor is how you customize the alert. First, set the width and height of your alert, these values are in pixels. Use Add Image and Add Text buttons to add elements. After adding, you can drag elements to move them around or use the right-click context menu to customize them further.',

	'help.command.command': 'Choose the command the viewer will use for this command. Commands must start with an exclamation mark',
	'help.command.response': 'This is the main output when a viewer types the command in chat. If you have enabled "Editable in chat", this value will be updated with the text provided after the command',
	'help.command.format': 'This is the format the response will be nested in when "Editable in chat" is enabled. For example, if the current response is 1337 and the format is set to "Number is: {text}" - Whenever someone uses the command, it will output: "Number is: 1337"',
	'help.command.cooldown': 'Specify the number of seconds between command uses. Minimum: 10 seconds',
	'help.command.permissions': 'Specify who can use this command',
	'help.command.visible': 'Will be visible in the public commands list [NOT YET IMPLEMENTED]',
	'help.command.editable': 'If enabled, moderators can edit the response of the command from chat by putting the new text after the command. Example: "!command ASD" will set the response to "ASD"',

	'help.message.type': 'The type of custom message you want to create',
	'help.message.text': 'The text that will be output when the message event is triggered',
	'help.message.interval': 'Number of seconds after which this scheduled message will posted to chat. Note: The message will only run when your stream is live',

	'help.quote.text': 'Enter the quoted text, the streamer\'s name and timestamp will automatically be appended',

	// Multi-Line
	'help.message.type.donation': `<b>Replacement Keywords</b><br />
		<ul>
			<li>{nickname} - Donor's name</li>
			<li>{amount} - Donation amount</li>
			<li>{currency} - Donation currency</li>
			<li>{message} - Donation message</li>
		</ul>
		<br />
		<b>Example:</b><br />
		<code>Donation from {nickname} for {amount} {currency} - {message}</code><br />
		-><br />
		<code>Donation from Ninja101 for 5.00 USD - Test Message!</code>`,
	'help.message.type.resubscriber': `<b>Replacement Keywords</b><br />
		<ul>
			<li>{name} - Subscriber\'s name</li>
		</ul>
		<br />
		<b>Example:</b><br />
		<code>Welcome back, {name}!</code><br />
		-><br />
		<code>Welcome back, Ninja101!</code>`,
	'help.message.type.scheduled': 'This message will be posted into chat every time the specified interval has elapsed, but only while your stream is live.',
	'help.message.type.subscriber': `<b>Replacement Keywords</b><br />
		<ul>
			<li>{name} - Subscriber\'s name</li>
		</ul>
		<br />
		<b>Example:</b><br />
		<code>Welcome, {name}!</code><br />
		-><br />
		<code>Welcome, Ninja101!</code>`,
	'help.message.type.sub_share': `<b>Replacement Keywords</b><br />
		<ul>
			<li>{name} - Subscriber\'s name</li>
			<li>{months} - Subscription length</li>
			<li>{message} - The message (blank, if none given) given by the user</li>
		</ul>
		<br />
		<b>Example:</b><br />
		<code>Thanks for subscribing for {months} months, {name}! Message: {message}</code><br />
		-><br />
		<code>Thanks for subscribing for 12 months, Ninja101! Message: Best streamer :)</code>`,
};