import React, { useContext } from "react";
import RootContext from "../../context/root";
import { SceneMetadataItem, VideoFileItem } from "../../context/types";

const fs = require("fs");
const childProcess = require("child_process");
const rimraf = require("rimraf");

const videoElementWrapperStyle = {
  display: "inline-block",
  width: "33.333%",
  margin: "0px",
};

const videoElementStyle = {
  width: "100%",
};

const textPanelStyle = {
  width: "100%",
  padding: "10px 0px",
  background: "#444444",
  color: "white",
  fontSize: "10px",
  fontFamily: "arial",
};

const textStyle = {
  marginLeft: "10px",
};

export const Videos: React.FunctionComponent = (_props) => {
  const rootContext = useContext(RootContext);

  if (
    !rootContext.setIsProcessed ||
    !rootContext.setLoading ||
    !rootContext.setSceneMetadata ||
    !rootContext.setVideoFiles
  ) {
    return <></>;
  }

  // A bit of a cheeky hack this. I want to make sure that
  // all every file in the list of images captured from a video file
  // has been created. I am prepared to wait (hence `existsSync`).
  // If any single item in the list has not yet been found to exist,
  // then check the list again, until we're sure that every image frame has
  // been generated.
  const checkAllFilesExist = (files: string[]) => {
    files.forEach((item: string) => {
      if (!fs.existsSync(item)) {
        checkAllFilesExist(files);
      }
    });
  };

  // After evaluating a video, update the metadata item to indicate is it's
  // mucky or not.
  const updateMetadata = (
    metadata: SceneMetadataItem[] | undefined,
    sceneIndex: number,
    imageResponse: string
  ) => {
    return metadata
      ? [
          ...metadata.slice(0, sceneIndex),
          [...metadata[sceneIndex], Boolean(JSON.parse(imageResponse) > -0.5)],
          ...metadata.slice(sceneIndex + 1),
        ]
      : [];
  };

  // The next two functions are just a cleanup.
  const getProcessVideoCommand = (arg: string[]) => {
    return `"${arg[0]}public/dist/process-video.exe" "${arg[1]}${arg[2]}" --ifolder "${arg[3]}" --images`;
  };

  const getEvaluateImagesCommand = (arg: string[]) => {
    return `"${arg[0]}public/dist/evaluate-images/evaluate-images.exe" "${arg[1]}" --model "${arg[0]}public/dist/ResNet50_nsfw_model.pth"`;
  };

  if (!rootContext.isProcessed) {
    rootContext.setIsProcessed(true);

    const rootPath = process.cwd().replace("build", "");
    const tmpDirPath = `${rootPath}public/tmp/`;

    const evaluateScene = (
      sceneIndex: number,
      updatedMeta: SceneMetadataItem[] | null
    ) => {
      if (!rootContext.videoFiles) return <></>;

      // This temporary folder is the key to the whole program.
      // For each individual video file split out from the upload,
      // I will capture a sample of images from it. Those sampled images are
      // then store in this folder.
      // Once they are all in place, we can then use the evaluate-images CLI program to
      // check each individial image for NSFW content.
      const tmpImageDirPath = `${tmpDirPath}${rootContext.videoFiles[sceneIndex]}-images/`;

      if (!fs.existsSync(tmpImageDirPath)) {
        childProcess.exec(
          getProcessVideoCommand([
            rootPath,
            tmpDirPath,
            rootContext.videoFiles[sceneIndex],
            tmpImageDirPath,
          ]),
          (_err: NodeJS.ErrnoException, filelist: string) => {
            try {
              const imageList = JSON.parse(filelist);

              // The way this is done is suboptimal.
              // It mostly because the evaluate-images CLI program currently only
              // works with folders of images.
              checkAllFilesExist(imageList);

              // Now we're ready to check our temporary image folder for pr0ns.
              childProcess.exec(
                getEvaluateImagesCommand([rootPath, tmpImageDirPath]),
                (_err: NodeJS.ErrnoException, nsfwEstimate: string) => {
                  // Once the command is complete, we can delete the temp folder.
                  rimraf.sync(tmpImageDirPath);

                  if (!rootContext.setSceneMetadata || !rootContext.videoFiles)
                    return <></>;

                  const metadata: SceneMetadataItem[] | undefined = updatedMeta
                    ? updatedMeta
                    : rootContext.sceneMetadata;
                  // Update the metadata with opinion of if a given clip is NSFW.
                  const updatedMetadata: SceneMetadataItem[] = updateMetadata(
                    metadata,
                    sceneIndex,
                    nsfwEstimate
                  ) as SceneMetadataItem[];

                  // Store the updated metadata list.
                  rootContext.setSceneMetadata(updatedMetadata);

                  if (sceneIndex < rootContext.videoFiles.length) {
                    // While there are video scene clips to check for their NSFW status,
                    // recursively run the evaluate-images process on each successive video.
                    evaluateScene(sceneIndex + 1, updatedMetadata);
                  }
                }
              );
            } catch (e) {}
          }
        );
      }
    };

    // Evaluate the first video.
    evaluateScene(0, null);
  }

  return rootContext.sceneMetadata ? (
    <div style={{ position: "absolute", top: "50px" }}>
      {rootContext.videoFiles && rootContext.videoFiles.length
        ? rootContext.videoFiles.map((item: VideoFileItem, index: number) => {
            const isNSFW =
              rootContext.sceneMetadata &&
              rootContext.sceneMetadata[index] &&
              rootContext.sceneMetadata[index][2] !== undefined &&
              rootContext.sceneMetadata[index][2] !== null
                ? rootContext.sceneMetadata[index][2]
                : null;

            return (
              <div key={index} style={videoElementWrapperStyle}>
                {/* Display our video clips */}
                <video key={item} style={videoElementStyle} controls>
                  <source src={`/tmp/${item}`} type="video/mp4" />
                </video>
                <div
                  style={{
                    ...textPanelStyle,
                    // Depending on the NSFW status of each clip,
                    // change the colour of the banner that displays the metadata.
                    background:
                      isNSFW === null || isNSFW === undefined
                        ? "#898989"
                        : isNSFW
                        ? "#ad3333"
                        : "#318359",
                  }}
                >
                  {rootContext.sceneMetadata &&
                    rootContext.sceneMetadata[index] && (
                      <span style={textStyle}>
                        {/* This is where we display the metadata for each video */}
                        From: {rootContext.sceneMetadata[index][0]}, To:{" "}
                        {rootContext.sceneMetadata[index][1]}
                      </span>
                    )}
                  {isNSFW && (
                    <span
                      style={{
                        ...textStyle,
                        float: "right",
                        display: "inline-block",
                        marginRight: "10px",
                      }}
                    >
                      NSFW!
                    </span>
                  )}
                </div>
              </div>
            );
          })
        : []}
    </div>
  ) : (
    <></>
  );
};
