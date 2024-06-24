import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const ReadmePreview = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="readme-preview p-4">
      <input type="file" accept=".md" onChange={handleFileUpload} className="mb-4" />
      {fileContent ? (
        <div className="markdown-content">
          <ReactMarkdown>{fileContent}</ReactMarkdown>
        </div>
      ) : (
        <div className="text-gray-500">No file selected</div>
      )}
    </div>
  );
};

export default ReadmePreview;
