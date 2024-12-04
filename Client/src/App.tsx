import React, { useEffect, useState } from 'react';
import './App.css';
import { title } from 'process';
import { log } from 'console';
import axios from 'axios';

type Note = {
  id: number;
  title: string;
  content: string;
}

const App = () => {
  const [selectedNote, setSelectedNote] =
    useState<Note | null>(null);




  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get('https://node-express-typescript-notes-project.onrender.com/api/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchNotes();
  }, []);

 


  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    console.log('Selected Note: ', note);
    setContent(note.content);
    setTitle(note.title);
  }

  const [notes, setNotes] = useState<Note[]>([]);

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')


  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("title: ", title, " content: ", content);
    const newNote = {
      title: title,
      content: content,
    };
    try {
      const response = await axios.post('https://node-express-typescript-notes-project.onrender.com/api/notes', {title,content} );
      setNotes(prevNotes => [...prevNotes, response.data]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleupdateNote = (
    event: React.FormEvent
  ) => {
    event.preventDefault();
    if (!selectedNote) {
      return;
    }

    const updatedNote: Note = {
      id: selectedNote.id,
      title: title,
      content: content,
    };
    axios.put(`https://node-express-typescript-notes-project.onrender.com/api/notes/${selectedNote.id}`, updatedNote);
    const updatedNotesList = notes.map(note => note.id === selectedNote.id ? updatedNote : note);
    setNotes(updatedNotesList);
    setTitle('');
    setContent('');
    setSelectedNote(null);
  }

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setSelectedNote(null);
    console.log('Cancel Note');
  }

  const deleteNote = (
    event: React.MouseEvent,
    noteId: number
  )  => {
    event.stopPropagation();
    try {
      axios.delete(`https://node-express-typescript-notes-project.onrender.com/api/notes/${noteId}`);
      setNotes(notes.filter(note => note.id!== noteId));
    } catch (error) {
      console.error('Error:', error);
    }
    const updatedNotes = notes.filter(note => note.id!== noteId);
    setNotes(updatedNotes)
  };

  return (
    <div className="app-container">
      <form className='note-form' onSubmit={(event) =>
        selectedNote
          ? handleAddNote(event)
          : handleAddNote(event)
      }>
        <h2>Notes</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder='title'
          required
        ></input>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder='Content'
          rows={10}
          required
        ></textarea>
        {selectedNote ? (
          <div className='edit-buttons'>
            <button type='submit' onClick={handleupdateNote}>Save</button>

            <button style={{ backgroundColor: 'red' }} onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button type='submit'>Add Note</button>

        )}
      </form>
      <div className='notes-grid'>
        {notes.map(note => (
          <div className='note-item'
            onClick={() => handleNoteClick(note)}>
            <div className='notes-header'>
              <button onClick={(event)=>deleteNote(event,note.id) 
              }
              >X</button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}

      </div>
    </div>
  );
}

export default App;