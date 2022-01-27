import React, { useContext } from 'react';
import RootContext from '../../context/root';

const fs = require('fs');
const childProcess = require('child_process');
const rimraf = require('rimraf');

const videoElementWrapperStyle = {
  display: "inline-block",
  width: "33.333%",
  margin: "0px"
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
  fontFamily: "arial"
};

const textStyle = {
  marginLeft: "10px"
};

export const Videos: React.FunctionComponent = () => {
  const rootContext: any = useContext(RootContext);

  if (!rootContext.isProcessed) {
    const rootPath = process.cwd().replace("build", "")
    rootContext.setIsProcessed(true);

    const tmpDirPath = `${rootPath}public/tmp/`;

    const evaluateScene = (sceneIndex: number, updatedMeta: any) => {
      const tmpImageDirPath = `${tmpDirPath}${rootContext.videoFiles[sceneIndex]}-images/`;

      if (!fs.existsSync(tmpImageDirPath)) {
        childProcess.exec(`"${rootPath}public/dist/process-video.exe" "${tmpDirPath}${rootContext.videoFiles[sceneIndex]}" --ifolder "${tmpImageDirPath}" --images`, (err: any, filelist: any) => {
          const fileList = JSON.parse(filelist);

          function checkAllFilesExist(files: any) {
            files.forEach((item: any) => {
              if (!fs.existsSync(item)) {
                checkAllFilesExist(files);
              }
            });
          };

          checkAllFilesExist(fileList);

          childProcess.exec(`"${rootPath}public/dist/evaluate-images/evaluate-images.exe" "${tmpImageDirPath}" --model "${rootPath}public/dist/ResNet50_nsfw_model.pth"`, (err: any, imageResponse: any) => {
            rimraf.sync(tmpImageDirPath);

            const metadata = updatedMeta ? updatedMeta : rootContext.sceneMetadata;
            const spliced = [
              ...metadata.slice(0, sceneIndex),
              [...metadata[sceneIndex], Boolean(JSON.parse(imageResponse) > -0.5)],
              ...metadata.slice(sceneIndex + 1)
            ];

            console.log(spliced, sceneIndex)

            rootContext.setSceneMetadata(spliced);

            if (sceneIndex < rootContext.videoFiles.length)
              evaluateScene(sceneIndex + 1, spliced);
          });
        });
      }
    }

    evaluateScene(0, null);
  }

  return (
    rootContext.sceneMetadata && <div style={{ position: "absolute", top: "50px" }}>
      {
        rootContext.videoFiles.length ? rootContext.videoFiles.map((item: any, index: number) => {
          const isNSFW = (
            rootContext.sceneMetadata && 
            rootContext.sceneMetadata[index] && 
            rootContext.sceneMetadata[index][2] !== undefined &&
            rootContext.sceneMetadata[index][2] !== null ? rootContext.sceneMetadata[index][2] : null
          );

          return (
            <div key={index} style={videoElementWrapperStyle}>
              <video key={item} style={videoElementStyle} controls> 
                <source src={`/tmp/${item}`} type="video/mp4"/>
              </video>
              <div style={{ 
                ...textPanelStyle, 
                background: (
                  isNSFW === null || 
                  isNSFW === undefined ? "#898989" : 
                  isNSFW !== undefined && isNSFW === true ? 
                  "#ad3333" : "#318359" 
                )
              }}>
              <span style={textStyle}>From: {rootContext.sceneMetadata[index][0]}, To: {rootContext.sceneMetadata[index][1]}</span>
              { isNSFW && <span style={{...textStyle, float: "right", display: "inline-block", marginRight: "10px"}}>NSFW!</span> }
            </div>     
          </div>
          )
        }) : []
      }
    </div>
  );
};