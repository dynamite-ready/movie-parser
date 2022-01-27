import React, { useRef, useContext } from 'react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import {RootContext} from '../../context/root';
import { Spinner, SpinnerSize, Overlay } from 'office-ui-fabric-react';

const rimraf = require('rimraf');
const fs = require('fs');
const process = require('process');
const childProcess = require('child_process');

export const Header: React.FunctionComponent = (props: any) => {
  const rootPath = process.cwd().replace("build", "");
  // This variable is probably the first context store property candidate.
  const tmpDirPath = `${rootPath}public/tmp/`;
  const rootContext: any = useContext(RootContext);
  const $fileUpload = useRef<HTMLInputElement>(document.createElement("input"));
  
  if(!fs.existsSync(tmpDirPath)) 
    // rimraf.sync(tmpDirPath);
    fs.mkdirSync(tmpDirPath);

  const openFileDialog = () => {
    if($fileUpload) {
      $fileUpload.current.click();
    }
  }

  const updateFilename = () => {
    rootContext.setIsProcessed(false);
    // Only do stuff if the file has realy changed.
    if(!$fileUpload.current.value) return;

    // Good point at which to add a loader...
    rootContext.setLoading(true);
    rootContext.setSceneMetadata(null);
    props.history.push('/');

    rimraf.sync(tmpDirPath);

    const command = childProcess.spawn(`"${rootPath}public/dist/process-video.exe"`, [`"${$fileUpload.current.value}"`], { shell: true });

    command.stdout.on("data", (data: any) => {
      try {
        const outputString = data.toString();
        const metadata = JSON.parse(outputString);
        rootContext.setSceneMetadata(metadata);
      } catch (error) {
        // We're merely swallowing these errors for now.
        console.log("On Data Error: ", error);
      }
    });

    command.on("close", (code: any) => {
      try {
        // Move all the files.
        if(!fs.existsSync(tmpDirPath))
          fs.mkdirSync(tmpDirPath);
        
        const tmpDir = fs.readdirSync(`${rootPath}build/`);
  
        tmpDir.forEach((element: any) => {
          if(element.slice(0,3) === "tmp") {
            fs.renameSync(`${rootPath}build/${element}`, `${tmpDirPath}${element}-${new Date().getTime()}`);
          }
        });
  
        rootContext.setVideoFiles(fs.readdirSync(tmpDirPath));
  
        props.history.push('/videos');
        rootContext.setLoading(false);
      } catch(error)  {
        console.log("On Close Error: ", error);
      }
    });
  }

  const menuItems = [
    {
      key: 'upload',
      name: 'Upload',
      onClick: openFileDialog,
      ['data-automation-id']: 'uploadButton'
    }
  ];
    
  return (
    <div>
      <div style={{
        position: "absolute", 
        width: "100%", 
        height: "100%"
      }}>
        { rootContext.loading &&
          <Overlay style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 1001
          }}>
            <Spinner
              style={{position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}
              size={SpinnerSize.large} 
            />
          </Overlay>
        }
        <input 
          ref={$fileUpload} 
          style={{display: "none"}} 
          type="file" 
          onChange={updateFilename} 
          accept="video/mp4"
        />
      </div>
      <CommandBar
        items={menuItems}
        styles={{ 
          root: {
            position: "fixed",
            width: "100%",
            height: "50px",
            padding: "0px",
            zIndex: 1000
          } 
        }}
        overflowButtonProps={{ ariaLabel: 'More commands' }}
        ariaLabel={'Use left and right arrow keys to navigate between commands'}
      />
    </div>
  );
};