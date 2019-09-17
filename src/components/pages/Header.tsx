import React, { useState, useRef, useContext } from 'react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import {RootContext} from '../../context/root';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';

const gui = require('nw.gui');
const fs = require('fs');
const process = require('process');
const childProcess = require('child_process');
var win = gui.Window.get();
win.showDevTools();

// Why won't this work as a variable in typescript?
// const loadingOverlayStyle = {
//   position: "fixed",
//   width: "100%",
//   height: "100%",
//   background: "white",
//   zIndex: 1,
//   opacity: 0.6 
// };

export const Header: React.FunctionComponent = (props: any) => {
  const rootContext: any = useContext(RootContext);

  const $fileUpload = useRef<HTMLInputElement>(document.createElement("input"));

  const openFileDialog = () => {
    if($fileUpload) {
      $fileUpload.current.click();
    }
  }

  const updateFilename = () => {
    // Only do stuff if the file has realy chnaged.
    if(!$fileUpload.current.value) return;

    // Good point at which to add a loader...
    rootContext.setLoading(true);
    props.history.push('/');

    // This variable is probably the first context store property candidate.
    const tmpDirPath = `${process.cwd()}/../public/tmp/`;
    
    // Also, clear whatever came before.
    fs.readdirSync(tmpDirPath).forEach((element: any) => {
      if(element.slice(0,3) === "tmp") {
        fs.unlinkSync(`${tmpDirPath}${element}`);
      }
    });

    fs.rmdirSync(tmpDirPath);

    const command = childProcess.spawn(`${process.cwd()}/../public/dist/movie-parser.exe`, [$fileUpload.current.value], { shell: true });

    command.on("data", (data: any) => {
      console.log("SUSPECT: ", data, $fileUpload.current.value);
    });

    command.on("close", (code: any) => {
      console.log(code, $fileUpload.current.value)

      fs.mkdirSync(tmpDirPath);
      fs.readdirSync(process.cwd()).forEach((element: any) => {
        if(element.slice(0,3) === "tmp") {
          fs.renameSync(`${process.cwd()}/${element}`, `${tmpDirPath}${element}`);
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
          <div style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "white",
            zIndex: 1,
            opacity: 0.6 
          }}>
            <Spinner
              style={{position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}
              size={SpinnerSize.large} 
            />
          </div>
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