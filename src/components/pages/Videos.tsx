import React, { useContext } from 'react';
import RootContext from '../../context/root';
import { SceneMetadataItem, VideoFileItem } from '../../context/types';

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

export const Videos: React.FunctionComponent = (_props) => {
  const rootContext = useContext(RootContext);

  if(
    !rootContext.setIsProcessed ||
    !rootContext.setLoading ||
    !rootContext.setSceneMetadata ||
    !rootContext.setVideoFiles
  ) { return <></>; }

  const checkAllFilesExist = (files: string[]) => {
    files.forEach((item: string) => {
      if (!fs.existsSync(item)) {
        checkAllFilesExist(files);
      }
    });
  };  

  const updateMetadata = (
    metadata: SceneMetadataItem[] | undefined, 
    sceneIndex: number, 
    imageResponse: string
  ) => {
    return (
      metadata ? [
        ...metadata.slice(0, sceneIndex),
        [...metadata[sceneIndex], Boolean(JSON.parse(imageResponse) > -0.5)],
        ...metadata.slice(sceneIndex + 1)
      ] : []
    )
  };

  const getProcessVideoCommand = (arg: string[]) => {
    return `"${arg[0]}public/dist/process-video.exe" "${arg[1]}${arg[2]}" --ifolder "${arg[3]}" --images`
  }

  const getEvaluateVideoCommand = (arg: string[]) => {
    return `"${arg[0]}public/dist/evaluate-images/evaluate-images.exe" "${arg[1]}" --model "${arg[0]}public/dist/ResNet50_nsfw_model.pth"`
  }

  if (!rootContext.isProcessed) {
    rootContext.setIsProcessed(true);
  
    const rootPath = process.cwd().replace("build", "")
    const tmpDirPath = `${rootPath}public/tmp/`;
  
    const evaluateScene = (sceneIndex: number, updatedMeta: SceneMetadataItem[] | null) => {
      if(!rootContext.videoFiles) return <></>;

      const tmpImageDirPath = `${tmpDirPath}${rootContext.videoFiles[sceneIndex]}-images/`;

      if (!fs.existsSync(tmpImageDirPath)) {
        childProcess.exec(getProcessVideoCommand([rootPath, tmpDirPath, rootContext.videoFiles[sceneIndex], tmpImageDirPath]), (_err: NodeJS.ErrnoException, filelist: string) => {
          try {
            const fileList = JSON.parse(filelist);
  
            checkAllFilesExist(fileList);
  
            childProcess.exec(getEvaluateVideoCommand([rootPath, tmpImageDirPath]), (_err: NodeJS.ErrnoException, imageResponse: string) => {
              rimraf.sync(tmpImageDirPath);
  
              if(!rootContext.setSceneMetadata || !rootContext.videoFiles) return <></>; 
  
              const metadata: SceneMetadataItem[] | undefined = updatedMeta ? updatedMeta : rootContext.sceneMetadata;
              const updatedMetadata: SceneMetadataItem[] = updateMetadata(metadata, sceneIndex, imageResponse) as SceneMetadataItem[];
  
              rootContext.setSceneMetadata(updatedMetadata);
  
              if (sceneIndex < rootContext.videoFiles.length)
                evaluateScene(sceneIndex + 1, updatedMetadata);
            });
          } catch(e) {}
        });
      }
    }

    evaluateScene(0, null);
  }

  return (
    rootContext.sceneMetadata ? <div style={{ position: "absolute", top: "50px" }}>
      {
        rootContext.videoFiles && rootContext.videoFiles.length ? rootContext.videoFiles.map((item: VideoFileItem, index: number) => {
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
                  isNSFW ? 
                  "#ad3333" : "#318359" 
                )
              }}>
                {
                  (rootContext.sceneMetadata && rootContext.sceneMetadata[index]) && 
                  <span style={textStyle}>
                    From: {rootContext.sceneMetadata[index][0]}, To: {rootContext.sceneMetadata[index][1]}
                  </span>
                }
              { isNSFW && <span style={{...textStyle, float: "right", display: "inline-block", marginRight: "10px"}}>NSFW!</span> }
            </div>     
          </div>
          )
        }) : []
      }
    </div> : <></>
  )
};