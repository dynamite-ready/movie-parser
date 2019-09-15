import React, { useContext } from 'react';
import RootContext from '../../context/root';

const fs = require('fs');

const videoElementStyles = {
  display: "inline-block", 
  width: "33%",
  margin: "0px" 
};


export const Videos: React.FunctionComponent = () => {
  const rootContext: any = useContext(RootContext);

  return (
    <div>
        {
          rootContext.videoFiles.length ? rootContext.videoFiles.map((item: any) => {
            return (
              <video key={item} style={videoElementStyles} controls> 
                <source src={`/tmp/${item}`} type="video/mp4"/>
              </video>
            )
          }): []
        }
    </div>
  );
};