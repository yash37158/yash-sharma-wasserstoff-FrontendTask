import React, { useState } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineCloseCircle } from 'react-icons/ai';

type Note = {
  id: string;
  content: string;
  status: 'todo' | 'inProgress' | 'done';
};

const NoteMaker = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteStatus, setNewNoteStatus] = useState<Note['status']>('todo');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const createNote = (content: string, status: Note['status']) => {
    setNotes([
      ...notes,
      { id: Date.now().toString(), content: content, status: status },
    ]);
    setNewNoteContent('');
  };

  const moveNote = (id: string, status: Note['status']) => {
    setNotes(notes.map(note => note.id === id ? { ...note, status } : note));
  };

  const handleDrop = (item: Note, status: Note['status']) => {
    moveNote(item.id, status);
  };

  const renderNotes = (status: Note['status']) => {
    return notes.filter(note => note.status === status).map(note => (
      <NoteItem key={note.id} note={note} onDrop={handleDrop} />
    ));
  };

  const openModal = (e: React.MouseEvent) => {
    setIsModalOpen(true);
    setModalPosition({ x: e.clientX, y: e.clientY });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewNoteContent('');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="note-maker">
        <div className="new-note">
          <button onClick={openModal}>Add Note</button>
        </div>
        <div className="categories flex">
          {['todo', 'inProgress', 'done'].map((status) => (
            <Category key={status} status={status} onDrop={handleDrop}>
              <h3>{status.charAt(0).toUpperCase() + status.slice(1)}</h3>
              <div className="notes">{renderNotes(status as Note['status'])}</div>
            </Category>
          ))}
        </div>
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="modal-content bg-white p-4 rounded-md shadow-md"
                style={{
                  position: 'absolute',
                  top: `${modalPosition.y}px`,
                  left: `${modalPosition.x}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="modal-header flex justify-between items-center mb-4">
                  <h2>Enter Note Content</h2>
                  <AiOutlineCloseCircle
                    className="cursor-pointer text-red-500"
                    onClick={closeModal}
                  />
                </div>
                <input
                  type="text"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Note content"
                  className="w-full mb-4 p-2 border border-gray-300 rounded-md"
                />
                <select
                  value={newNoteStatus}
                  onChange={(e) => setNewNoteStatus(e.target.value as Note['status'])}
                  className="w-full mb-4 p-2 border border-gray-300 rounded-md"
                >
                  <option value="todo">To Do</option>
                  <option value="inProgress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="modal-footer flex justify-end">
                  <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md"
                    onClick={() => {
                      createNote(newNoteContent, newNoteStatus);
                      closeModal();
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DndProvider>
  );
};

const Category = ({ status, onDrop, children }: any) => {
  const [, drop] = useDrop({
    accept: 'NOTE',
    drop: (item: Note) => onDrop(item, status),
  });

  const categoryRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    drop(categoryRef.current);
  }, [drop]);

  return (
    <div ref={categoryRef} className="category flex-1 p-4 bg-gray-200 rounded-md">
      {children}
    </div>
  );
};

const NoteItem = ({ note, onDrop }: { note: Note, onDrop: (item: Note, status: Note['status']) => void }) => {
  const [{ isDragging }] = useDrag({
    type: 'NOTE',
    item: note,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`note-item p-2 mb-2 bg-white rounded-md shadow-md ${isDragging ? 'opacity-50' : ''}`}
    >
      {note.content}
    </motion.div>
  );
};

export default NoteMaker;
