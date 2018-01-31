# Stahpbot Frontend

Stahpbot was shut down in late 2017 and I will be slowly making all the code public. 90% of the code was written with very little knowledge at the beginning, learning as I went along, while aiming to follow best practices. For this project, the [Angular Style Guide](https://angular.io/guide/styleguide) was a great help.

This was a personal project that spawned from a friend's need for a Twitch.tv chat bot in his channel in the early days when using large scale bots weren't so commonplace. It started as a tiny Python bot running by itself, then I added a small web frontend to go with it. After a couple of months other users expressed interest in using the bot, so the Python app got rewritten for use with multiple channels. Then in 2015, Stahpbot was used by a very popular channel and the Python app was struggling to handle message throughput. The Python app was scrapped and I wrote the final version in C++ and that's where it got left.

## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.