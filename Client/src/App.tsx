import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CircularIndeterminate from './components/Loading';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@mui/material';
import { FcGoogle } from 'react-icons/fc';
import  Microsofticon  from "./microsoft.png";

type Note = {
  id: number;
  title: string;
  content: string;
};

const App = () => {
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading: authLoading } = useAuth0();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
        redirect_uri: "https://node-express-typescript-notes-project-1.onrender.com",
        // redirect_uri: "http://localhost:3000", // Ensure this matches your app's URL
        
      },
    });
  };


  const handleMicrosoftLogin = () => {
    
    loginWithRedirect({
      authorizationParams: {
        connection: "windowslive", // This is the connection name for Microsoft
         redirect_uri: "https://node-express-typescript-notes-project-1.onrender.com",
        //  redirect_uri: "http://localhost:3000", // Ensure this matches your app's URL
        scope: "openid profile email", // Optional, adjust scopes as needed
      },
    });
  };

  if (isAuthenticated && user) {
    axios.defaults.headers.common['x-user-email'] = user.email;
  }
  
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotes = async () => {
        try {
          const response = await axios.get('https://node-express-typescript-notes-project.onrender.com/api/notes');
          setNotes(response.data);
          setError(null);
        } catch (error) {
          console.error('Error:', error);
          setError('Failed to fetch notes. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchNotes();
    } else {
      setIsLoading(false); // No notes to fetch if not authenticated
    }
  }, [isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <h2>
        Loading... <CircularIndeterminate />
      </h2>
    );
  }

  if (!isAuthenticated) {
    axios.get('https://node-express-typescript-notes-project.onrender.com/check', { timeout: 1 }).catch((error) => {
      if (axios.isCancel(error)) {
        // Request was canceled, do nothing
        console.log('Request canceled');
      } else {
        console.error('Error:', error);
      }
    });    return (
      <div >
        
        <h2>Welcome to Notes App</h2>
        <p>Please log in to access your notes.</p>
        <Button style={{backgroundColor:'black'}} onClick={() => loginWithRedirect()}>Log In</Button>
        
        {/* <div className="app-container"> */}
        <div className="notes-grid app-container">
        
        <div className="note-item">
        
          
        
        <div className="notes-header" >
          <h2 >Start making notes.... </h2>
          </div>

          <br></br>
          
      <button
        className="log-button button0 button2"
        style={{borderRadius:'10px',boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.3)"  }}
        onClick={handleGoogleLogin}
      >
        <FcGoogle style={{fontSize: '29px' }}/> Sign in with Google
      </button>
    
      <button
        className="log-button button0 button2 login_button" 
        style={{borderRadius:'10px',boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.3)" ,paddingTop:'10px', paddingBottom:'10px'}}

        onClick={handleMicrosoftLogin}
      >
        <img src={Microsofticon} style={{width:'8%'}} /> Sign in with Microsoft
      </button>
        </div>
        </div>
      
      </div>
    );
  }

  

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setContent(note.content);
    setTitle(note.title);
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();
    const newNote = { title, content };
    try {
      const response = await axios.post('https://node-express-typescript-notes-project.onrender.com/api/notes', newNote);
      setNotes((prevNotes) => [...prevNotes, response.data]);
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUpdateNote = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedNote) return;

    const updatedNote: Note = {
      id: selectedNote.id,
      title,
      content,
    };
    axios.put(`https://node-express-typescript-notes-project.onrender.com/api/notes/${selectedNote.id}`, updatedNote);
    const updatedNotesList = notes.map((note) =>
      note.id === selectedNote.id ? updatedNote : note
    );
    setNotes(updatedNotesList);
    setTitle('');
    setContent('');
    setSelectedNote(null);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    setSelectedNote(null);
  };

  const deleteNote = async (event: React.MouseEvent, noteId: number) => {
    event.stopPropagation();
    try {
      await axios.delete(`https://node-express-typescript-notes-project.onrender.com/api/notes/${noteId}`);
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error('Error:', error);
    }
  };




  return (
    <div className="app-container">

      <form
        className="note-form"
        onSubmit={(event) => (selectedNote ? handleUpdateNote(event) : handleAddNote(event))}
      >
        <h2>Notes</h2>
        <p>Welcome, {user?.name || 'User'}!</p>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Content"
          rows={10}
          required
        />
        {selectedNote ? (
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="submit">Add Note</button>
        )}
      </form>

      <div className="notes-grid">
        {notes.map((note) => (
          <div className="note-item" onClick={() => handleNoteClick(note)} key={note.id}>
            <div className="notes-header">
              <button onClick={(event) => deleteNote(event, note.id)}>
                <HighlightOffIcon />
              </button>
            </div>
            <h2>{note.title}</h2>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
      <div className="user-info">
          
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Log Out</button>
        </div>
    </div>
  );
};

export default App;
