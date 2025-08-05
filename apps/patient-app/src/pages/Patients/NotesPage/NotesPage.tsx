import React, { useState } from 'react';
import { Container, Header, Title, Content } from '@patient-portal/ui-components';
import { useFetchNotes, useSaveNewNotes, useUpdateNote, useDeleteNote } from '@patient-portal/api-client';
import type { Note } from '@patient-portal/common-types';
import dayjs, { Dayjs } from 'dayjs';
import { NoteEditor } from './components/NoteEditor';
import { NotesSidebar } from './components/NotesSidebar';

const NotesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [draftNote, setDraftNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: notesResponse } = useFetchNotes(selectedDate.year(), selectedDate.month() + 1);
  const notes = (notesResponse as any)?.data || [];

  const saveNewNotesMutation = useSaveNewNotes(selectedDate.year(), selectedDate.month() + 1);
  const updateNoteMutation = useUpdateNote(selectedDate.year(), selectedDate.month() + 1);
  const deleteNoteMutation = useDeleteNote(selectedDate.year(), selectedDate.month() + 1);

  const filteredNotes = searchTerm
    ? notes.filter((note: Note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.content?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;
  
  const selectedNote = draftNote || (selectedNoteId ? notes.find((note: Note) => note.id === selectedNoteId) : null);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    setDraftNote(null);
  };

  const handleNoteDeselect = () => {
    setSelectedNoteId('');
    setDraftNote(null);
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    if (draftNote && updatedNote.id === draftNote.id) {
      // Update draft note locally
      setDraftNote(updatedNote);
    } else {
      // Update existing note via API
      updateNoteMutation.mutate({
        noteId: updatedNote.id,
        diary_entry: updatedNote.content,
        title: updatedNote.title,
      });
    }
  };

  const handleAddNote = () => {
    const newNote: Partial<Note> = {
      title: 'New Note',
      content: '',
      patientId: '', // This should be provided by the parent component
      status: 'draft' as any, // This should be provided by the parent component
      priority: 'low' as any, // This should be provided by the parent component
    };
    setDraftNote(newNote as Note);
  };

  const handleSaveNote = (noteToSave: Partial<Note>) => {
    if (draftNote && noteToSave.id === draftNote.id) {
      // Save draft note to main notes array
      // save notes to api
      saveNewNotesMutation.mutate({
        title: noteToSave.title || '',
        content: noteToSave.content || '',
      });
      setDraftNote(null);
    }
  };

  const handleDeleteNote = () => {
    if (selectedNote?.id) {
      deleteNoteMutation.mutate({
        noteId: selectedNote.id
      });
    }
  };

  const handleCancelDraft = () => {
    setDraftNote(null);
    // Don't auto-select any note - let the user choose
  };

  return (
    <Container>
      <Header>
        <Title>Notes</Title>
      </Header>
      <Content>
        <NotesSidebar
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNoteSelect={handleNoteSelect}
          onNoteDeselect={handleNoteDeselect}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <div style={{ flex: 1, height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
          {selectedNote ? (
            <NoteEditor
              key={selectedNote?.id}
              note={selectedNote}
              onNoteUpdate={handleNoteUpdate}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onCancelDraft={handleCancelDraft}
              isDraft={!!draftNote}
            />
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#6C757D',
              fontSize: '1.1rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#495057' }}>No Note Selected</h3>
              <p style={{ margin: 0, textAlign: 'center' }}>
                Select a note from the sidebar to view and edit it,<br />
                or click "Add New" to create a new note.
              </p>
            </div>
          )}
        </div>
      </Content>
    </Container>
  );
};

export default NotesPage; 