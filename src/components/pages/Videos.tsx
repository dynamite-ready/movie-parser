import React from 'react';

const fs = require('fs');

const videoElementStyles = {
  display: "inline-block", 
  width: "33%", 
  margin: "0px" 
};


export const Videos: React.FunctionComponent = () => {
  const tmpDirPath = `${process.cwd()}/../public/tmp/`;
  const videoFiles = fs.readdirSync(tmpDirPath);

  return (
    <div>
        {
          videoFiles.map((item: any) => {
            return (
              <video key={item} style={videoElementStyles} controls> 
                <source src={`/tmp/${item}`} type="video/mp4"/>
              </video>
            )
          })
        }
    </div>
  );
};