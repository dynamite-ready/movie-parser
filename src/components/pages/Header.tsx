import React, { useEffect, useState, useRef } from 'react';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';

const videoElementStyles = {
  display: "inline-block", 
  width: "33%", 
  margin: "0px" 
};

export const Header: React.FunctionComponent = () => {
  var gui = require('nw.gui');
  var win = gui.Window.get();
  win.showDevTools();
  
  const [filename, setFilename] = useState(null);
  const $fileUpload = useRef<HTMLInputElement>(document.createElement("input"));

  const openFileDialog = () => {
    if($fileUpload) {
      $fileUpload.current.click();
    }
  }

  const updateFilename = (e: any) => {
    console.log(e);
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