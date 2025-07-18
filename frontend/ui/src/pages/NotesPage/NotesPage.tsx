import React, { useState } from 'react';
import { NotesSidebar, NoteEditor } from './components';
import { NotesPageContainer } from './NotesPage.styles';
import type { Note } from './types';
import { Header, Title, Container } from '../../styles/GlobalStyles';
import SharedDatePicker from '../../components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useFetchNotes, useSaveNewNotes, useUpdateNote } from '../../restful/notes';

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'Patient Number 1 Checkup',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      preview: 'Lorem impsum is a simple dummy text that is ued for dummy obj...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Patient Number 2 Checkup',
      content: 'Second patient checkup notes with detailed observations and recommendations.',
      preview: 'Second patient checkup notes with detailed observations...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Follow-up Appointment',
      content: 'Follow-up appointment notes for patient recovery progress.',
      preview: 'Follow-up appointment notes for patient recovery...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState<string>('1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [draftNote, setDraftNote] = useState<Note | null>(null);
  const [forceEdit, setForceEdit] = useState(true);

  // const { data: notes, isLoading, error } = useFetchNotes(selectedDate.year(), selectedDate.month()+1);
  // console.log(notes);

  const filteredNotes = notes.filter(note => {
    const noteDate = dayjs(note.createdAt);
    const matchesDate =
      noteDate.year() === selectedDate.year() &&
      noteDate.month() === selectedDate.month();
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });
  
  const selectedNote = draftNote || notes.find(note => note.id === selectedNoteId);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    setDraftNote(null);
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    if (draftNote && updatedNote.id === draftNote.id) {
      // Update draft note
      setDraftNote(updatedNote);
    } else {
      // Update existing note
      setNotes(prevNotes => {
        const newNotes = prevNotes.map(note => 
          note.id === updatedNote.id 
            ? { ...updatedNote, updatedAt: new Date().toISOString() }
            : note
        );
        return newNotes;
      });
    }
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      preview: '',
      createdAt: selectedDate.toDate().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDraftNote(newNote);
    setSelectedNoteId(newNote.id);
  };

  const handleSaveNote = (noteToSave: Note) => {
    if (draftNote && noteToSave.id === draftNote.id) {
      // Save draft note to main notes array
      setNotes(prevNotes => [noteToSave, ...prevNotes]);
      setDraftNote(null);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prevNotes => {
      const newNotes = prevNotes.filter(note => note.id !== noteId);
      
      // Handle selection after deletion
      if (selectedNoteId === noteId) {
        const currentIndex = prevNotes.findIndex(note => note.id === noteId);
        if (newNotes.length === 0) {
          // No notes left, clear selection
          setSelectedNoteId('');
        } else if (currentIndex >= newNotes.length) {
          // Deleted the last note, select the previous one
          setSelectedNoteId(newNotes[newNotes.length - 1].id);
        } else {
          // Select the note at the same index (which is now the next note)
          setSelectedNoteId(newNotes[currentIndex].id);
        }
      }
      
      return newNotes;
    });
    
    // Clear draft if it was deleted
    if (draftNote && draftNote.id === noteId) {
      setDraftNote(null);
    }
  };

  const handleCancelDraft = () => {
    setDraftNote(null);
    // Select the first available note
    if (notes.length > 0) {
      setSelectedNoteId(notes[0].id);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Notes</Title>
      </Header>
      <NotesPageContainer>
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
          <div style={{ padding: '1rem 0', flexShrink: 0 }}>
            <SharedDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              fullWidth={true}
            />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <NotesSidebar
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onNoteSelect={handleNoteSelect}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          </div>
        </div>
        <div style={{ flex: 1, height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
          {selectedNote && (
            <NoteEditor
              key={selectedNote?.id}
              note={selectedNote}
              onNoteUpdate={handleNoteUpdate}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onCancelDraft={handleCancelDraft}
              isDraft={!!draftNote}
              forceEdit={forceEdit}
              onForceEditHandled={() => setForceEdit(false)}
            />
          )}
        </div>
      </NotesPageContainer>
    </Container>
  );
};

export default NotesPage; 