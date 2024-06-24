import React, { createContext, useState, useContext, ReactNode } from 'react';

type File = {
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  children?: File[];
  content?: string;
};

// Define the type for the context's value
type FileContextType = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  updateFileContent: (name: string, content: string) => void;
};

// Create a context with an undefined default value
const FileContext = createContext<FileContextType | undefined>(undefined);

// Provider component to wrap around the parts of the app that need access to the context
export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Function to update the content of the selected file
  const updateFileContent = (name: string, content: string) => {
    if (selectedFile && selectedFile.name === name) {
      setSelectedFile({ ...selectedFile, content });
    }
  };

  return (
    <FileContext.Provider value={{ selectedFile, setSelectedFile, updateFileContent }}>
      {children}
    </FileContext.Provider>
  );
};



// Custom hook to use the FileContext
export const useFile = (): FileContextType => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
};
