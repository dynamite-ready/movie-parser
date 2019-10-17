import React, { useContext } from 'react';
import RootContext from '../../context/root';
const fs = require('fs');
const childProcess = require('child_process');

export const Videos: React.FunctionComponent = () => {
  const rootContext: any = useContext(RootContext);
  
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

  if(!rootContext.isProcessed) {
    rootContext.setIsProcessed(true);
    console.log(rootContext.videoFiles);
    const tmpDirPath = `${process.cwd()}/../public/tmp/`;
    
    const evaluateScene = (sceneIndex: any) => {
      const tmpImageDirPath = `${tmpDirPath}${rootContext.videoFiles[sceneIndex]}-images/`;
      
      if(!fs.existsSync(tmpImageDirPath)) {
        childProcess.exec(`${process.cwd()}/../public/dist/process-video.exe --images file ${tmpDirPath}${rootContext.videoFiles[sceneIndex]} --ifolder ${tmpImageDirPath}`, (err: any, filelist: any) => {
          const fileList = JSON.parse(filelist);

          function checkAllFilesExist(files: any) {
            files.forEach((item: any) => {
              if(!fs.existsSync(item)) {
                checkAllFilesExist(files);
              }
            });
          };

          checkAllFilesExist(fileList);

          childProcess.exec(`${process.cwd()}/../public/dist/evaluate-images.exe ${tmpImageDirPath}`, (err: any, imageResponse: any) => {
            const spliced = [
              ...rootContext.sceneMetadata.slice(0, sceneIndex),
              [...rootContext.sceneMetadata[sceneIndex], JSON.stringify(imageResponse)],
              ...rootContext.sceneMetadata.slice(sceneIndex)
            ];

            console.log(spliced, rootContext.sceneMetadata);

            rootContext.setSceneMetadata(spliced);

            console.log(err, imageResponse);

            if(sceneIndex < rootContext.videoFiles.length)
              evaluateScene(sceneIndex + 1);
          });          
        });
      }
    }

    evaluateScene(0);
  }
  
  return (
    <div>
        {
          rootContext.videoFiles.length ? rootContext.videoFiles.map((item: any, index: number) => {
            return (
              <div key={index} style={videoElementWrapperStyle}>
                <video key={item} style={videoElementStyle} controls> 
                  <source src={`/tmp/${item}`} type="video/mp4"/>
                </video>
                <div style={textPanelStyle}>

                  {/* { rootContext.sceneMetadata && rootContext.sceneMetadata[index] && rootContext.sceneMetadata[index][2] ? rootContext.sceneMetadata[index][2] : null } */}
                  {/* <span style={textStyle}>from: {rootContext.sceneMetadata && rootContext.sceneMetadata[index] ? rootContext.sceneMetadata[index][0] : null}, to: {rootContext.sceneMetadata && rootContext.sceneMetadata[index] ? rootContext.sceneMetadata[index][1] : null}</span> */}
                  {JSON.stringify(rootContext.sceneMetadata && JSON.stringify(rootContext.sceneMetadata[index]))}
                </div>     
              </div>
            )
          }): []
        }
    </div>
  );
};