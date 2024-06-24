import React from 'react';

const NoteEditor = ({ fileName }: { fileName: string }) => {
  return (
    <div className="h-full flex flex-col flex-grow">
      <h2 className="mb-2">Editing {fileName}</h2>
      <textarea className="w-full h-full p-2 border border-gray-300 rounded flex-grow overflow-auto" />
    </div>
  );
};

export default NoteEditor;
