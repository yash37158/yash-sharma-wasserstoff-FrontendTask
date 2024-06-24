import React, { useState } from 'react';

type ListItem = {
  id: string;
  content: string;
  completed: boolean;
};

const ListMaker = () => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemContent, setNewItemContent] = useState('');

  const addItem = () => {
    if (newItemContent.trim() !== '') {
      const newItem: ListItem = {
        id: Date.now().toString(),
        content: newItemContent,
        completed: false,
      };
      setItems([...items, newItem]);
      setNewItemContent('');
    }
  };

  const toggleComplete = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="list-maker">
      <div className="new-item flex mb-4">
        <input
          type="text"
          value={newItemContent}
          onChange={(e) => setNewItemContent(e.target.value)}
          placeholder="Enter item content"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addItem}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="list">
        {items.map(item => (
          <li key={item.id} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleComplete(item.id)}
              className="mr-2"
            />
            <span className={item.completed ? 'line-through' : ''}>
              {item.content}
            </span>
            <button
              onClick={() => removeItem(item.id)}
              className="ml-auto bg-red-500 text-white px-2 py-1 rounded"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListMaker;
