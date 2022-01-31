import React, { useEffect, useState } from "react";
import {
  ContextProviderProps,
  ContextState,
  SceneMetadataItem,
  VideoFileItem,
} from "./types";

export const RootContextObject: ContextState = {
  isProcessed: false,
  loading: false,
  videoFiles: [],
  sceneMetadata: [],
};

export const RootContext = React.createContext<ContextState>(RootContextObject);

export const RootContextProvider = ({ children }: ContextProviderProps) => {
  const [videoFiles, setVideoFiles] = useState<VideoFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sceneMetadata, setSceneMetadata] = useState<SceneMetadataItem[]>([]);
  const [isProcessed, setIsProcessed] = useState(false);

  return (
    <RootContext.Provider
      value={{
        // Getters
        isProcessed,
        loading,
        videoFiles,
        sceneMetadata,

        // Setters
        setIsProcessed,
        setLoading,
        setSceneMetadata,
        setVideoFiles,
      }}
    >
      {children}
    </RootContext.Provider>
  );
};

export default RootContext;
