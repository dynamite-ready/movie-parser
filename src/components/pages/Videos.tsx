import React, { useContext } from 'react';
import RootContext from '../../context/root';

const fs = require('fs');
const childProcess = require('child_process');
const rimraf = require('rimraf');

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
    
    const evaluateScene = (sceneIndex: any, updatedMeta: any) => {
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

          childProcess.exec(`${process.cwd()}/../public/dist/evaluate-images/evaluate-images.exe ${tmpImageDirPath}`, (err: any, imageResponse: any) => {
            rimraf.sync(tmpImageDirPath);
            
            const metadata = updatedMeta ? updatedMeta : rootContext.sceneMetadata;
            const spliced = [
              ...metadata.slice(0, sceneIndex),
              [...metadata[sceneIndex], JSON.parse(imageResponse)],
              ...metadata.slice(sceneIndex)
            ];

            console.log(spliced, rootContext.sceneMetadata);

            rootContext.setSceneMetadata(spliced);

            console.log(err, imageResponse);

            if(sceneIndex < rootContext.videoFiles.length)
              evaluateScene(sceneIndex + 1, spliced);
          });          
        });
      }
    }

    evaluateScene(0, null);
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
                <div style={{ 
                  ...textPanelStyle, 
                  background: 
                    rootContext.sceneMetadata[index][2] === null || 
                    rootContext.sceneMetadata[index][2] === undefined ? "#444444" : 
                    rootContext.sceneMetadata[index][2] !== undefined && rootContext.sceneMetadata[index][2] == true ? 
                    "#FF0000" : "#007100" 
                }}>
                  <span style={textStyle}>from: {rootContext.sceneMetadata[index][0]}, to: {rootContext.sceneMetadata[index][1]}</span>
                </div>     
              </div>
            )
          }): []
        }
    </div>
  );
};