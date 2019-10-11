import React, { useState } from "react";

export const RootContext: any = React.createContext({videoFiles: null, setVideoFiles: null});

export const RootContextProvider: React.FunctionComponent = (props) => {
    const [videoFiles, setVideoFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sceneMetadata, setSceneMetadata] = useState(null);
    const [isProcessed, setIsProcessed] = useState(false);
    
    return (
        <RootContext.Provider value={
            {
                isProcessed,
                setIsProcessed,

                // Get and set videoFiles...
                videoFiles, 
                setVideoFiles,

                // Get and set loading status...
                loading, 
                setLoading,
                
                // Get and set sceneMetadata...
                sceneMetadata, 
                setSceneMetadata                
            }
        }>
            {props.children}
        </RootContext.Provider>
    );
};

export default RootContext;