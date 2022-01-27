import React from "react";

// This will be a list of strings in the following format:
// [ Start Time, End Time, Is NSFW? ]
export type SceneMetadataItem = string[];

// This will be a file path.
export type VideoFileItem = string;

// My State object contains 8 properties, 4 of them are
// `useState` setters. There is no reducer.
export type ContextState = {
  isProcessed: boolean; // Are the videos processed yet?
  loading: boolean; // Are we in the middle of processing vids?
  sceneMetadata?: SceneMetadataItem[]; // Metadata for each video.
  videoFiles?: VideoFileItem[]; // A list of video file paths
  
  // Basic `useState` setters for all the above properties.  
  setIsProcessed?: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
  setSceneMetadata?: React.Dispatch<React.SetStateAction<SceneMetadataItem[]>>
  setVideoFiles?: React.Dispatch<React.SetStateAction<VideoFileItem[]>>
}

export type ContextProviderProps = {
  children: React.ReactNode
}