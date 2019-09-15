import React, { useState } from "react";

export const RootContext: any = React.createContext({videoFiles: null, setVideoFiles: null});

export const RootContextProvider: React.FunctionComponent = (props) => {
    const [videoFiles, setVideoFiles] = useState(true);
    return (
        <RootContext.Provider value={
            {videoFiles, setVideoFiles}
        }>
            {props.children}
        </RootContext.Provider>
    );
};

export default RootContext;