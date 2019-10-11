import React, { useContext } from 'react';
import RootContext from '../../context/root';
import { mkdirSync } from 'fs';

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
    
    // rootContext.videoFiles.forEach((item: any) => {
      const tmpImageDirPath = `${tmpDirPath}${rootContext.videoFiles[0]}-images/`;
  
      console.log("HEEEEEEY!!?");
      
      if(!fs.existsSync(tmpImageDirPath)) {
        childProcess.exec(`${process.cwd()}/../public/dist/process-video.exe --images file ${tmpDirPath}${rootContext.videoFiles[0]} --ifolder ${tmpImageDirPath}`, (err: any, filelist: any) => {
          const fileList = JSON.parse(filelist);

          function checkAllFilesExist(files: any) {
            console.log("IS THIS WORKING?: ", files)
            files.forEach((item: any) => {
              console.log("IS THIS WORKING?: ", fs.existsSync(item))
              if(!fs.existsSync(item)) {
                checkAllFilesExist(files);
              }
            });
          };

          checkAllFilesExist(fileList);

          console.log("I SCRATCH MY CHIN...");

          childProcess.exec(`${process.cwd()}/../public/dist/evaluate-images.exe folder ${tmpImageDirPath}`, (err: any, imageResponse: any) => {
            console.log(err, imageResponse);
          });          
        });
      }
  }
  // });
  
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
                  <span style={textStyle}>from: {rootContext.sceneMetadata[index][0]}, to: {rootContext.sceneMetadata[index][1]}</span>
                </div>     
              </div>
            )
          }): []
        }
    </div>
  );
};