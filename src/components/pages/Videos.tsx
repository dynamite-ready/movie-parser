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

  console.log(rootContext.videoFiles);
  const tmpDirPath = `${process.cwd()}/../public/tmp/`;
  
  rootContext.videoFiles.forEach((item: any) => {
    const tmpImageDirPath = `${tmpDirPath}${item}-images`;
    
    if(!fs.existsSync(tmpImageDirPath)) {
      // fs.mkdirSync(tmpImageDirPath);
      childProcess.exec(`${process.cwd()}/../public/dist/process-video.exe --images file ${tmpDirPath}${item} --ifolder ${tmpImageDirPath}/`, (data: any) => {
        console.log(data, " WHAT THE ABSOLUTE?");
      });
    }
  });

  // First I neeed to create an image folder for each of the videos
  
  return (
    <div>
        {
          rootContext.videoFiles.length ? rootContext.videoFiles.map((item: any, index: number) => {
            return (
              <div style={videoElementWrapperStyle}>
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