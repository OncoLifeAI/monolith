import React, { useState, useEffect } from 'react';
import { NotesSidebar, NoteEditor } from './components';
import { NotesPageContainer } from './NotesPage.styles';
import type { Note, NoteResponse } from './types';
import { Header, Title, Container } from '../../styles/GlobalStyles';
import SharedDatePicker from '../../components/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useFetchNotes, useSaveNewNotes, useUpdateNote } from '../../restful/notes';

const NotesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  // Fetch notes from API
  const { data: notesResponse, isLoading, error } = useFetchNotes(selectedDate.year(), selectedDate.month() + 1);
  const notes: Note[] = (notesResponse as NoteResponse)?.data ?? [];

  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [draftNote, setDraftNote] = useState<Note | null>(null);
  const [forceEdit, setForceEdit] = useState(true);

  // Hooks for API mutations
  const saveNewNotesMutation = useSaveNewNotes(selectedDate.year(), selectedDate.month() + 1);
  const updateNoteMutation = useUpdateNote(selectedDate.year(), selectedDate.month() + 1);

  // On initial load, select the first note if available
  useEffect(() => {
    if (
      notes.length > 0 &&
      (!selectedNoteId || !notes.some(note => note.id === selectedNoteId))
    ) {
      setSelectedNoteId(notes[0].id || '');
    }
  }, [notes, selectedNoteId]);

  const filteredNotes = searchTerm
    ? notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.diary_entry?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;
  
  const selectedNote = draftNote || notes.find(note => note.id === selectedNoteId) || notes[0] || null;

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    setDraftNote(null);
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    if (draftNote && updatedNote.id === draftNote.id) {
      // Update draft note locally
      setDraftNote(updatedNote);
    } else {
      // Update existing note via API
      updateNoteMutation.mutate({
        noteId: updatedNote.entry_uuid || '',
        diary_entry: updatedNote.diary_entry
      });
    }
  };

  const handleAddNote = () => {
    const newNote: Note = {
      title: 'New Note',
      diary_entry: '',
      created_at: selectedDate.toDate().toISOString(),
      marked_for_doctor: false
    };
    setDraftNote(newNote);
  };

  const handleSaveNote = (noteToSave: Note) => {
    if (draftNote && noteToSave.id === draftNote.id) {
      // Save draft note to main notes array
      // save notes to api
      saveNewNotesMutation.mutate({
        content: noteToSave.diary_entry
      });
      setDraftNote(null);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    // This part of the logic needs to be adapted to the new 'notes' array
    // For now, we'll just update the draft note if it's the selected one
    if (selectedNote && selectedNote.id === noteId) {
      setDraftNote(null);
    }
  };

  const handleCancelDraft = () => {
    setDraftNote(null);
    // Select the first available note
    if (notes.length > 0) {
      setSelectedNoteId(notes[0].id || '');
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