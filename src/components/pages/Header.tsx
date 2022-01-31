import React, { useRef, useContext, useState } from "react";
import { CommandBar } from "office-ui-fabric-react/lib/CommandBar";
import { RootContext } from "../../context/root";
import {
  Spinner,
  SpinnerSize,
  Overlay,
  Image,
  IImageProps,
  AnimationStyles,
  mergeStyles,
} from "office-ui-fabric-react";
import { RouteComponentProps } from "react-router-dom";

type HeaderProps = {
  history: RouteComponentProps["history"];
};

const rimraf = require("rimraf");
const fs = require("fs");
const process = require("process");
const childProcess = require("child_process");
const gui = require("nw.gui");

export const Header: React.FunctionComponent<HeaderProps> = ({ history }) => {
  const rootContext = useContext(RootContext);
  const $fileUpload = useRef<HTMLInputElement>(document.createElement("input"));
  const [fadeOut, setFadeOut] = useState(false);

  if (
    !rootContext.setIsProcessed ||
    !rootContext.setLoading ||
    !rootContext.setSceneMetadata ||
    !rootContext.setVideoFiles
  ) {
    return <></>;
  }

  const rootPath = `${process.cwd()}/`;
  const tmpDirPath = `${rootPath}temp/`;

  // Create an empty temporary folder in the `/public` directory
  // if it doesn't yet exist.
  if (!fs.existsSync(tmpDirPath)) {
    fs.mkdirSync(tmpDirPath);
  }

  const openFileDialog = () => {
    if ($fileUpload) {
      $fileUpload.current.click();
    }
  };

  const processVideo = () => {
    if (
      // Must be a better way to handle these guards.
      !rootContext.setIsProcessed ||
      !rootContext.setLoading ||
      !rootContext.setSceneMetadata
    ) {
      return;
    }

    // Only do stuff if the file has realy changed.
    if (!$fileUpload.current.value) return;

    rootContext.setIsProcessed(false);

    // Good point at which to add a loader...
    rootContext.setLoading(true);
    rootContext.setSceneMetadata([]);
    history.push("/");

    // Delete the temporary video folder. if left over from a
    // previous upload.
    rimraf.sync(tmpDirPath);

    // Call the `process-video` CLI. We will use NodeJS's
    // `childProcess.spawn` command and it's evented API to process
    // the CLI response.
    const processVideoCommand = childProcess.spawn(
      `${rootPath}bin/process-video.exe`,
      [`"${$fileUpload.current.value}"`],
      { shell: true }
    );

    // This event handler runs whenever data comes back from the `process-video`
    // CLI command. We deserialize the data, and then store the metadata for
    // the videos the CLI program has generated. These videos are initially stored
    // In a unnamed temporary folder. This is because the Python `SceneDetect`
    // module, AFAIK, doesn't have a way to chose where the files go.
    processVideoCommand.stdout.on("data", (data: BinaryType[]) => {
      try {
        if (!rootContext.setSceneMetadata) {
          return;
        }

        const outputString = data.toString();
        const metadata = JSON.parse(outputString);
        rootContext.setSceneMetadata(metadata); // This is when the data is stored.
      } catch (error) {
        // We're merely swallowing these errors for now.
        // This is a hack...
      }
    });

    // When the process-video CLI program has finished, first want to move the
    // generated videos into a named folder, and then store a path to each video
    // for further processing later on.
    processVideoCommand.on("close", (_code: number) => {
      try {
        if (!rootContext.setLoading || !rootContext.setVideoFiles) return;

        // Create a temp folder if one doesn't yet exist.
        if (!fs.existsSync(tmpDirPath)) fs.mkdirSync(tmpDirPath);

        // By default the vids are dumped into the `/build` folder.
        // Read it's contents.
        const tmpDir: string[] = fs.readdirSync(`${rootPath}`);

        tmpDir.forEach((element: string) => {
          // If an item inside the build folder has a filename beginning
          // with 'tmp', we move the file to the `/public` folder.
          if (element.slice(0, 3) === "tmp") {
            fs.renameSync(
              `${rootPath}${element}`,
              `${tmpDirPath}${element}-${new Date().getTime()}`
            );
          }
        });

        // Store a list of all the videos that have been created.
        rootContext.setVideoFiles(fs.readdirSync(tmpDirPath));

        // Change page...
        history.push("/videos");

        // The task is done, we can remove the loading modal.
        rootContext.setLoading(false);
      } catch (error) {}
    });
  };

  // The euphoric joy of a frontend component library...
  const menuItems = [
    {
      key: "upload",
      name: "Upload",
      onClick: openFileDialog,
      ["data-automation-id"]: "upload-button"
    }
  ];
  
  const farMenuItems = [
    {
      key: "about",
      name: "About",
      iconOnly: true,
      onClick: () => { gui.Shell.openExternal("http://localhost:3000/post/automating-video-curation-how-practical-is-ai") },
      ["data-automation-id"]: "about-link",
      style: { right: "20px" },
      menuIconProps: {
        iconName: 'Help'
      }
    },
  ];

  // A ropey splash image...
  const imageProps: Partial<IImageProps> = {
    src: "./nsfw-app-splash-screen.png",
    styles: {
      root: {
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      },
    },
  };

  // A style to fade out the image.
  const fadeOutElement = mergeStyles(AnimationStyles.fadeOut400);

  // Apply the Fade out after a few seconds.
  setTimeout(() => {
    setFadeOut(true);
  }, 5000);

  return (
    <div>
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
      >
        {rootContext.loading && (
          <Overlay
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 1001,
            }}
          >
            <Spinner
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              size={SpinnerSize.large}
            />
          </Overlay>
        )}
        <input
          ref={$fileUpload}
          style={{ display: "none" }}
          type="file"
          onChange={processVideo}
          accept="video/mp4"
        />
      </div>
      <CommandBar
        items={menuItems}
        farItems={farMenuItems}
        styles={{
          root: {
            position: "fixed",
            width: "100%",
            height: "50px",
            padding: "0px",
            zIndex: 1000,
          },
        }}
      />
      <Image {...imageProps} className={fadeOut ? fadeOutElement : ""} />
    </div>
  );
};
