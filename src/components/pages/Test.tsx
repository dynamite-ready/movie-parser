import React, { useEffect, useState } from 'react';

const videoElementStyles = {
  display: "inline-block", 
  width: "33%", 
  margin: "0px" 
};

export const Test: React.FunctionComponent = () => {
    
    return (
      <div>
          {
            ["tmp-001", "tmp-002", "tmp-003", "tmp-004", "tmp-005"].map((item) => {
              return (
                <video key={item} style={videoElementStyles} controls> 
                  <source src={`C:/Users/rick.charles/Desktop/movie-parser-cli/${item}`} type="video/mp4"/>
                </video>
              )
            })
          }
      </div>
    );
};