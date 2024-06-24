import React from 'react';
import FolderStructure from './FolderStructure';
import TextEditor from './TextEditor';
import NoteMaker from './NoteMaker';
import ListMaker from './ListMaker';
import ReadmePreview from './ReadmePreview';
import { useFile } from '../context/FileContext';

const IDE = () => {
  const { selectedFile } = useFile();

  const renderEditor = () => {
    if (!selectedFile) return null;
    switch (selectedFile.extension) {
      case 'ed':
        return <TextEditor />;
      case 'note':
        return <NoteMaker />;
      case 'lt':
        return <ListMaker />;
      case 'readme':
        return <ReadmePreview />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1">
      <FolderStructure />
      <div className="editor-container flex-1">
        {renderEditor()}
      </div>
    </div>
  );
};

export default IDE;
