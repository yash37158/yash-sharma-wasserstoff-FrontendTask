import React, { useState } from 'react';
import {
  AiOutlineFolder,
  AiOutlineFile,
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineFolderAdd,
  AiOutlineFileAdd,
  AiOutlineCloseCircle,
  AiOutlineDelete
} from 'react-icons/ai';
import { marked } from 'marked';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Define the type for a File
type File = {
  name: string;
  type: 'file' | 'folder' | 'note' | 'list';
  extension?: string;
  children?: File[];
  content?: string;
};

// Define the type for a Note
type Note = {
  id: string;
  text: string;
  status: 'todo' | 'inProgress' | 'done';
};

// Define the type for a List Item
type ListItem = {
  id: string;
  text: string;
  completed: boolean;
};

// Define props for ListEditor component
type ListEditorProps = {
  file: File;
  updateFileContent: (name: string, content: string) => void;
};

// Define props for NoteEditor component
type NoteEditorProps = {
  file: File;
  updateFileContent: (name: string, content: string) => void;
};

const initialStructure: File[] = [
  { name: 'folder1', type: 'folder', children: [] },
  { name: 'file1.ed', type: 'file', extension: 'ed', content: '' },
];

const FolderStructure = () => {
  const [structure, setStructure] = useState<File[]>(initialStructure);
  const [expandedFolders, setExpandedFolders] = useState<{ [key: string]: boolean }>({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openedFiles, setOpenedFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; parentName: string | null }>({ visible: false, x: 0, y: 0, parentName: null });
  const [newItemName, setNewItemName] = useState<string>('');

  // Toggle the sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle folder expansion
  const toggleFolder = (name: string) => {
    setExpandedFolders((prevState) => ({ ...prevState, [name]: !prevState[name] }));
  };

  // Handle context menu event
  const handleContextMenu = (e: React.MouseEvent, parentName: string) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, parentName });
  }

  // Create a new folder
  const createFolder = () => {
    if (!contextMenu.parentName || !newItemName.trim()) return;
    const newFolder: File = { name: newItemName.trim(), type: 'folder', children: [] };
    const newStructure = addFileOrFolder(structure, contextMenu.parentName, newFolder);
    setStructure(newStructure);
    expandParentFolder(contextMenu.parentName);
    setContextMenu({ visible: false, x: 0, y: 0, parentName: null });
    setNewItemName('');
  };

  // Create a new file with the specified extension
  const createFile = (extension: string) => {
    if (!contextMenu.parentName || !newItemName.trim()) return;
    const newFile: File = { name: `${newItemName.trim()}.${extension}`, type: 'file', extension, content: '' };
    const newStructure = addFileOrFolder(structure, contextMenu.parentName, newFile);
    setStructure(newStructure);
    expandParentFolder(contextMenu.parentName);
    setContextMenu({ visible: false, x: 0, y: 0, parentName: null });
    setNewItemName('');
  };

  // Add a new file or folder to the structure
  const addFileOrFolder = (files: File[], parentName: string, newItem: File): File[] => {
    return files.map((file) => {
      if (file.type === 'folder' && file.name === parentName) {
        return {
          ...file,
          children: file.children ? [...file.children, newItem] : [newItem],
        };
      }
      if (file.children) {
        return {
          ...file,
          children: addFileOrFolder(file.children, parentName, newItem),
        };
      }
      return file;
    });
  };

  // Expand the parent folder to show the new item
  const expandParentFolder = (parentName: string) => {
    setExpandedFolders((prevState) => ({ ...prevState, [parentName]: true }));
  };

  // Open a file for editing
  const openFile = (file: File) => {
    setOpenedFiles((prevOpenedFiles) => {
      if (!prevOpenedFiles.some((openedFile) => openedFile.name === file.name)) {
        return [...prevOpenedFiles, file];
      }
      return prevOpenedFiles;
    });
    setActiveFile(file);
  };

  const closeFile = (fileName: string) => {
    setOpenedFiles((prevOpenedFiles) => prevOpenedFiles.filter((file) => file.name !== fileName));
    setActiveFile((prevActiveFile) => (prevActiveFile?.name === fileName ? null : prevActiveFile));
  };

  const deleteFileOrFolder = (name: string, parentName?: string) => {
    const deleteRecursively = (files: File[], itemName: string, parent?: string): File[] => {
      return files.reduce((acc, file) => {
        if (parent && file.name === parent) {
          const updatedChildren = file.children?.filter(child => child.name !== itemName) || [];
          return [...acc, { ...file, children: updatedChildren }];
        } else if (!parent && file.name !== itemName) {
          return [...acc, file];
        } else if (file.children) {
          return [...acc, { ...file, children: deleteRecursively(file.children, itemName, parent) }];
        }
        return acc;
      }, [] as File[]);
    };
  
    const newStructure = deleteRecursively(structure, name, parentName);
    setStructure(newStructure);
  };

  // Update the content of a file
  const updateFileContent = (name: string, content: string) => {
    setStructure((prevStructure) => updateFileContentInStructure(prevStructure, name, content));
    setOpenedFiles((prevOpenedFiles) => prevOpenedFiles.map((file) => (file.name === name ? { ...file, content } : file)));
    setActiveFile((prevActiveFile) => (prevActiveFile?.name === name ? { ...prevActiveFile, content } : prevActiveFile));
  };

  // Helper function to update file content in the structure
  const updateFileContentInStructure = (files: File[], name: string, content: string): File[] => {
    return files.map((file) => {
      if (file.type === 'file' && file.name === name) {
        return { ...file, content };
      }
      if (file.children) {
        return {
          ...file,
          children: updateFileContentInStructure(file.children, name, content),
        };
      }
      return file;
    });
  };

  // Render the folder structure recursively
  const renderStructure = (files: File[], level: number = 0, parentName?: string) => {
    return files.map((file) => (
      <div key={file.name} className={`pl-${level * 4}`} onContextMenu={(e) => handleContextMenu(e, file.name)}>
        {file.type === 'folder' ? (
          <div>
            <div className="flex items-center">
              <AiOutlineFolder className="mr-2 cursor-pointer text-blue-500" onClick={() => toggleFolder(file.name)} />
              {sidebarOpen && (
                <>
                  <span className="font-bold cursor-pointer flex-grow" onClick={() => toggleFolder(file.name)}>
                    {file.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    <AiOutlineFolderAdd className="cursor-pointer text-blue-500" onClick={(e) => handleContextMenu(e, file.name)} />
                    <AiOutlineFileAdd className="cursor-pointer text-green-500" onClick={(e) => handleContextMenu(e, file.name)} />
                    <AiOutlineDelete className="cursor-pointer text-red-500" onClick={() => deleteFileOrFolder(file.name, parentName)} />
                  </div>
                </>
              )}
            </div>
            {expandedFolders[file.name] && sidebarOpen && <div className="pl-4">{file.children && renderStructure(file.children, level + 1, file.name)}</div>}
          </div>
        ) : (
          <div className="flex items-center cursor-pointer hover:bg-gray-200 p-1 rounded" onClick={() => openFile(file)}>
            <AiOutlineFile className="mr-2 text-gray-500" />
            {sidebarOpen && <span>{file.name}</span>}
            <AiOutlineDelete className="ml-2 cursor-pointer text-red-500" onClick={(e) => { e.stopPropagation(); deleteFileOrFolder(file.name, parentName); }} />
          </div>
        )}
      </div>
    ));
  };

  const renderEditor = () => {
    if (!activeFile) {
      return <div className="flex-1 flex items-center justify-center">Select a file to start editing</div>;
    }
    if (activeFile.extension === 'readme' && previewMode) {
      return <div className="w-full h-full flex flex-col flex-grow p-4 bg-white border border-gray-300 rounded overflow-auto" dangerouslySetInnerHTML={{ __html: marked(activeFile.content || '') }} />;
    }
    if (activeFile.extension === 'lt') {
      return <ListEditor file={activeFile} updateFileContent={updateFileContent} />;
    }
    if (activeFile.extension === 'note') {
      return <NoteEditor file={activeFile} updateFileContent={updateFileContent} />;
    }
    return (
      <div className="h-full flex flex-col flex-grow">
        <h2 className="mb-2 flex items-center">
          Editing {activeFile.name}
          {activeFile.extension === 'readme' && (
            <button className="ml-3 bg-blue-500 text-white py-1 px-1 rounded" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          )}
        </h2>
        <textarea className="w-full h-full p-2 border border-gray-300 rounded flex-grow overflow-auto" value={activeFile.content} onChange={(e) => updateFileContent(activeFile.name, e.target.value)} />
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className={`sidebar bg-gray-100 h-full p-4 ${sidebarOpen ? 'auto' : 'w-16'} transition-all duration-300 overflow-y-auto`}>
        <button onClick={toggleSidebar} className="mb-4">
          {sidebarOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
        {renderStructure(structure)}
        <div className="mt-4">
          <h3 className="font-bold">Opened Files:</h3>
          <ul>
            {openedFiles.map((file) => (
              <li key={file.name} className="flex items-center">
                <span className={`cursor-pointer ${activeFile?.name === file.name ? 'font-bold' : ''}`} onClick={() => setActiveFile(file)}>
                  {file.name}
                </span>
                <AiOutlineCloseCircle className="ml-2 cursor-pointer text-red-500" onClick={() => closeFile(file.name)} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col p-4 overflow-hidden flex-grow">{renderEditor()}</div>
      {contextMenu.visible && (
        <div className="fixed bg-white shadow-md border rounded p-2" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Enter name" className="mb-2 p-1 border rounded w-full" />
          <div className="flex space-x-2">
            <button className="bg-blue-500 text-white p-1 rounded" onClick={createFolder}>
              Create Folder
            </button>
            <button className="bg-green-500 text-white p-1 rounded" onClick={() => createFile('ed')}>
              Create .ed File
            </button>
            <button className="bg-yellow-500 text-white p-1 rounded" onClick={() => createFile('note')}>
              Create .note File
            </button>
            <button className="bg-purple-500 text-white p-1 rounded" onClick={() => createFile('lt')}>
              Create .lt File
            </button>
            <button className="bg-red-500 text-white p-1 rounded" onClick={() => createFile('readme')}>
              Create .readme File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// List Editor function
  const ListEditor: React.FC<ListEditorProps> = ({ file, updateFileContent }) => {
  const [items, setItems] = useState<ListItem[]>(() => {
    try {
      return file.content ? JSON.parse(file.content) : [];
    } catch (e) {
      return [];
    }
  });

  const addItem = (text: string) => {
    const newItem: ListItem = {
      id: new Date().toISOString(),
      text,
      completed: false,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    updateFileContent(file.name, JSON.stringify(newItems));
  };

  const toggleItemCompletion = (id: string) => {
    const newItems = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setItems(newItems);
    updateFileContent(file.name, JSON.stringify(newItems));
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    updateFileContent(file.name, JSON.stringify(newItems));
  };

  return (
    <div className="h-full flex flex-col flex-grow p-4 bg-white border border-gray-300 rounded overflow-auto">
      <h2 className="mb-2">Editing {file.name}</h2>
      <input
        type="text"
        className="mb-2 p-2 border border-gray-300 rounded"
        placeholder="Add new item"
        onKeyDown={(e) => {
          if ( e.key === 'Enter' && e.currentTarget.value.trim()) {
            addItem(e.currentTarget.value.trim());
            e.currentTarget.value = '';
          }
        }}
      />
      <ul className="flex flex-col space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between">
            <span
              className={`flex-grow cursor-pointer ${item.completed ? 'line-through text-gray-400' : ''}`}
              onClick={() => toggleItemCompletion(item.id)}
            >
              {item.text}
            </span>
            <AiOutlineDelete className="cursor-pointer text-red-500" onClick={() => removeItem(item.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
};

//  Note Editor function
const NoteEditor: React.FC<NoteEditorProps> = ({ file, updateFileContent }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      return file.content ? JSON.parse(file.content) : [];
    } catch (e) {
      return [];
    }
  });

  const addNote = (text: string) => {
    const newNote: Note = {
      id: new Date().toISOString(),
      text,
      status: 'todo',
    };
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    updateFileContent(file.name, JSON.stringify(newNotes));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedNotes = Array.from(notes);
    const [movedNote] = updatedNotes.splice(result.source.index, 1);
    movedNote.status = result.destination.droppableId as 'todo' | 'inProgress' | 'done';
    updatedNotes.splice(result.destination.index, 0, movedNote);
    setNotes(updatedNotes);
    updateFileContent(file.name, JSON.stringify(updatedNotes));
  };

  return (
    <div className="h-full flex flex-col flex-grow p-4 bg-white border border-gray-300 rounded overflow-auto">
      <h2 className="mb-2">Editing {file.name}</h2>
      <input
        type="text"
        className="mb-2 p-2 border border-gray-300 rounded"
        placeholder="Add new note"
        onKeyDown={(e) => {
          if ( e.key === 'Enter' && e.currentTarget.value.trim()) {
            addNote(e.currentTarget.value.trim());
            e.currentTarget.value = '';
          }
        }}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        {['todo', 'inProgress', 'done'].map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div className="flex-1 p-2 border border-gray-300 rounded m-2" ref={provided.innerRef} {...provided.droppableProps}>
                <h3 className="font-bold">{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
                {notes.filter(note => note.status === status).map((note, index) => (
                  <Draggable key={note.id} draggableId={note.id} index={index}>
                    {(provided) => (
                      <div
                        className="p-2 bg-gray-100 border border-gray-300 rounded mb-2"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {note.text}
                        <AiOutlineDelete
                          className="cursor-pointer text-red-500 float-right"
                          onClick={() => {
                            const newNotes = notes.filter(n => n.id !== note.id);
                            setNotes(newNotes);
                            updateFileContent(file.name, JSON.stringify(newNotes));
                          }}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default FolderStructure;
