# Movie Parser

A quick prototype for a desktop application which can be used to open a movie file, and flag the frames which an ML model determines to be NSFW.
Still needs a lot of cleaning up...

## Notes

### 1: Build the app...

You will need run `npm run build` before all other commands, as the build command will 'spread' the contents of the `./public` 
folder into the `./build` folder, before the app can find the content of `./bin`.

### 2: Start the app...

You've already 'built' the app because of this weird architecture quirk that requires us to do so, but `npm run start` represents
the fastest way to build the app, and the only way to run Dev Tools for debugging. If you do need to debug, you can add the following
to any `.tsx` or `.ts` file in the src folder:

```
const win = gui.Window.get();
win.showDevTools();
```

### Manually installed dependencies

CLI programs for data processing should go in the `public/bin` folder. Then you should run `npm run build`.
Here's a list of the dependencies required:

- evaluate-images.exe
- process-video.exe
- mkvmerge.exe
- ResNet50_nsfw_model.pth

### Other quirks...

- When rebuilding the app to package it, always delete the build folder first...
- On Windows especially, the `npm run build` command will flake out, if you don't run the command from a terminal with administrator privileges...