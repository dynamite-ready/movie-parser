import React, { useRef, useContext } from 'react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import {RootContext} from '../../context/root';
import { Spinner, SpinnerSize, Overlay } from 'office-ui-fabric-react';

const rimraf = require('rimraf');
const fs = require('fs');
const process = require('process');
const childProcess = require('child_process');

// Why won't this work as a variable in typescript?
// const loadingOverlayStyle = {
//   position: "fixed",
//   width: "100%",
//   height: "100%",
//   background: "white",
//   zindex: 1,
//   opacity: 0.6 
// };

export const Header: React.FunctionComponent = (props: any) => {
  // This variable is probably the first context store property candidate.
  const tmpDirPath = `${process.cwd()}/../public/tmp/`;
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

    // Also, clear whatever came before.
    // fs.readdirSync(tmpDirPath).forEach((element: any) => {
    //   if(element.slice(0, 3) === "tmp") {
    //     fs.unlinkSync(`${tmpDirPath}${element}`);
    //   }
    // });

    rimraf.sync(tmpDirPath);

    const command = childProcess.spawn(`${process.cwd()}/../public/dist/process-video.exe`, [$fileUpload.current.value], { shell: true });

    command.stdout.on("data", (data: any) => {
      try {
        const outputString = data.toString();
        const metadata = JSON.parse(outputString);
        rootContext.setSceneMetadata(metadata);
      } catch (error) {
        // We're merely swallowing these errors for now.
      }
    });

    command.on("close", (code: any) => {
      // Move all the files.
      if(!fs.existsSync(tmpDirPath))
        fs.mkdirSync(tmpDirPath);
      
      fs.readdirSync(process.cwd()).forEach((element: any) => {
        if(element.slice(0,3) === "tmp") {
          fs.renameSync(`${process.cwd()}/${element}`, `${tmpDirPath}${element}-${new Date().getTime()}`);
        }
      });

      rootContext.setVideoFiles(fs.readdirSync(tmpDirPath));

      props.history.push('/videos');
      rootContext.setLoading(false);
    });
  }

  const menuItems = [
    {
      key: 'upload',
      name: 'Upload',
      iconProps: {
        iconName: 'Upload'
      },
      onClick: openFileDialog,
      ['data-automation-id']: 'uploadButton'
    }
    // {
    //   key: 'download',
    //   name: 'Download',
    //   iconProps: {
    //     iconName: 'Download'
    //   },
    //   onClick: () => console.log('Download'),
    //   href: 'https://dev.office.com/fabric',
    // }
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
            zIndex: 1
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
        overflowButtonProps={{ ariaLabel: 'More commands' }}
        ariaLabel={'Use left and right arrow keys to navigate between commands'}
      />
    </div>
  );
};