import React, { useEffect, useState, useRef } from 'react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { Link } from 'react-router-dom';

const gui = require('nw.gui');
const fs = require('fs');
const process = require('process');
const childProcess = require('child_process');

export const Header: React.FunctionComponent = (props: any) => {
  var win = gui.Window.get();
  win.showDevTools();
  
  const [filename, setFilename] = useState(null);
  const $fileUpload = useRef<HTMLInputElement>(document.createElement("input"));
  const $linkToDisplay = useRef<HTMLInputElement>(document.createElement("input"));

  const openFileDialog = () => {
    if($fileUpload) {
      $fileUpload.current.click();
    }
  }

  const updateFilename = (e: any) => {
    // Good point at which to add a loader...

    // Also, clear whatever came before.
    // fs.rmdirSync(`${process.cwd()}/../public/tmp`, {recursive: true});

    const command = childProcess.spawn(`${process.cwd()}/../public/dist/movie-parser.exe`, [$fileUpload.current.value], { shell: true });
    console.log(props, process.cwd(), command);

    command.stdout.on('data', (data: any) => {
      console.log(`stdout: ${data}`);
    });
    
    command.on("close", (code: any) => {
      console.log(`child process exited with code ${code}`);
      
      fs.mkdirSync(`${process.cwd()}/../public/tmp`);
      fs.readdirSync(process.cwd()).forEach((element: any) => {
        if(element.slice(0,3) === "tmp") {
          fs.renameSync(`${process.cwd()}/${element}`, `${process.cwd()}/../public/tmp/${element}`);
        }
      });

      props.history.push('/test');
      // Close the loader here...
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
        <input ref={$fileUpload} style={{display: "none"}} type="file" onChange={updateFilename}/>
        <CommandBar
          items={menuItems}
          overflowButtonProps={{ ariaLabel: 'More commands' }}
          ariaLabel={'Use left and right arrow keys to navigate between commands'}
        />
    </div>
  );
};