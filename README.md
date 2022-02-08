# The NSFW Movie Parser

An app to read a movie file, and indicate which scenes are NSFW. You can download the installer for [the Windows 10 version here](https://1drv.ms/u/s!AjqBQLCPd19igUS7zy_ENw7RN3G2).\
You also can find more information at - https://raskie.com/post/practical-ai-autodetecting-nsfw

## Using the app

| [![Launch the app](https://i.imgur.com/k9xZiHuh.png)](https://i.imgur.com/k9xZiHu.png) | [![Upload a video file](https://i.imgur.com/SIhRieth.png)](https://i.imgur.com/SIhRiet.png) | [![Check the file for NSFW content!](https://i.imgur.com/L3C9CKmh.png)](https://i.imgur.com/L3C9CKm.png) |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1: Launch                                                                              | 2: Upload                                                                                   | 3: Evaluate                                                                                              |

#### *The program is simple. After launching it, simply click the 'Upload' button (step 1). Once you've done that, use the file dialog to choose an \`.mp4\` file. After a short wait (step 2), the app will load and display a video for each scene detected in the video submitted. Then, step by step, the app will evaluate each scene, and highlight the banner under each vid to indicate it's NSFW status.*

## 1: Dependencies

These build instructions assume you are on Windows 10+. 
Building for OSX or Linux isn't that much harder though, but if you need help, you can raise an issue.

First of, you will need to install Node JS. You can find it here - https://nodejs.org/en/

You will then need to build the following CLI programs found in the accompanying Movie Parser CLI project,
found here - https://github.com/dynamite-ready/movie-parser-cli

- evaluate-images.exe
- process-video.exe

Instructions for building and running programs above, can be found in the repo, but you will also
need the following files to make the NSFW Movie Parser work

- `mkvmerge.exe` (found here - https://www.videohelp.com/software/MKVToolNix)
-`ResNet50_nsfw_model.pth` (found here - https://github.com/emiliantolo/pytorch_nsfw_model)

## 2: Installation

Using the command line, open a prompt in the project folder, and then:

```
npm install
```

## 3: Build

You will need to build the app, before you can start the program, as the build command will 'spread' the contents of the `./public` 
folder into the `./build` folder:

```
npm run build
```

## 4: Start

To run the app in test mode, use the following command:

```
npm start
```

This will run the application in a desktop window locally, so you can test and debug the code.

## Known bugs

- When rebuilding the app to package it, always delete the `./build` folder first
- On Windows especially, the `npm run build` command will flake out, if you don't run the command from a terminal with administrator privileges
- When compiling a build for production, the app will choke if `win.showDevTools();` is called
- The bigger the video, the longer it will take to process it. This app wasn't built for long movies