import React, { useState, useEffect } from 'react';
import { NotesSidebar, NoteEditor } from './components';
import { 
  NotesPageContainer, 
  MobileNavBar, 
  MobileNavButton, 
  MobileViewContainer, 
  MobileSidebarWrapper, 
  MobileEditorWrapper, 
  DesktopContainer,
  EmptyState
} from './NotesPage.styles';
import type { Note, NoteResponse } from './types';
import { Header, Title, Container } from '@oncolife/ui-components';
import { List, Edit3, ArrowLeft } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useFetchNotes, useSaveNewNotes, useUpdateNote, useDeleteNote } from '../../services/notes';

const NotesPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  // Fetch notes from API
  const { data: notesResponse } = useFetchNotes(selectedDate.year(), selectedDate.month() + 1);
  const notes: Note[] = (notesResponse as NoteResponse)?.data ?? [];

  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [draftNote, setDraftNote] = useState<Note | null>(null);
  
  // Mobile state management
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(true);

  // Hooks for API mutations
  const saveNewNotesMutation = useSaveNewNotes(selectedDate.year(), selectedDate.month() + 1);
  const updateNoteMutation = useUpdateNote(selectedDate.year(), selectedDate.month() + 1);
  const deleteNoteMutation = useDeleteNote(selectedDate.year(), selectedDate.month() + 1);
  // On initial load, select the first note if available
  useEffect(() => {
    // Only auto-select if we have a selectedNoteId that no longer exists in the notes
    if (
      selectedNoteId && 
      notes.length > 0 && 
      !notes.some(note => note.id === selectedNoteId)
    ) {
      // The previously selected note no longer exists, clear the selection
      setSelectedNoteId('');
    }
  }, [notes, selectedNoteId]);

  const filteredNotes = searchTerm
    ? notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.diary_entry?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : notes;
  
  // Add draft note to the beginning of the list if it exists
  const notesWithDraft = draftNote ? [draftNote, ...filteredNotes] : filteredNotes;
  
  const selectedNote = draftNote || (selectedNoteId ? notes.find(note => note.id === selectedNoteId) : null);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNoteId(noteId);
    setDraftNote(null);
    // On mobile, switch to editor view when a note is selected
    setShowMobileSidebar(false);
  };

  const handleNoteDeselect = () => {
    setSelectedNoteId('');
    setDraftNote(null);
    // On mobile, go back to sidebar when note is deselected
    setShowMobileSidebar(true);
  };

  const handleNoteUpdate = (updatedNote: Note) => {
    if (draftNote && updatedNote.id === draftNote.id) {
      // Update draft note locally
      setDraftNote(updatedNote);
    } else {
      // Update existing note via API
      updateNoteMutation.mutate({
        noteId: updatedNote.entry_uuid || '',
        diary_entry: updatedNote.diary_entry,
        title: updatedNote.title,
      });
    }
  };

  const handleAddNote = () => {
    const newNote: Note = {
      id: `draft-${Date.now()}`, // Temporary ID for the draft
      title: '',
      diary_entry: '',
      created_at: selectedDate.toDate().toISOString(),
      marked_for_doctor: false
    };
    setDraftNote(newNote);
    setSelectedNoteId(newNote.id || null);
    // On mobile, switch to editor view when adding a note
    setShowMobileSidebar(false);
  };

  const handleSaveNote = (noteToSave: Note) => {
    if (draftNote && noteToSave.id === draftNote.id) {
      // Save draft note to main notes array
      // save notes to api
      saveNewNotesMutation.mutate({
        content: noteToSave.diary_entry,
        title: noteToSave.title,
      });
      setDraftNote(null);
    }
  };

  const handleDeleteNote = () => {
    deleteNoteMutation.mutate({
      noteId: selectedNote?.entry_uuid || '',
    });
  };

  const handleCancelDraft = () => {
    setDraftNote(null);
    setSelectedNoteId(''); // Clear selection when canceling draft
    // On mobile, go back to sidebar when canceling draft
    setShowMobileSidebar(true);
  };

  // Mobile navigation handlers
  const handleShowSidebar = () => {
    setShowMobileSidebar(true);
  };

  const handleShowEditor = () => {
    setShowMobileSidebar(false);
  };

  const handleBackToNotes = () => {
    setShowMobileSidebar(true);
  };

  return (
    <Container>
      {/* Desktop Header - only show on desktop */}
      <div style={{ display: 'none' }}>
        <Header>
          <Title>Notes</Title>
        </Header>
      </div>
      
      <NotesPageContainer>
        {/* Desktop Layout */}
        <DesktopContainer>
          <Header>
            <Title>Notes</Title>
          </Header>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <NotesSidebar
              notes={notesWithDraft}
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
                <EmptyState>
                  <div className="empty-icon">📝</div>
                  <h3 className="empty-title">No Note Selected</h3>
                  <p className="empty-description">
                    Select a note from the sidebar to view and edit it, or click "Add New" to create a new note.
                  </p>
                </EmptyState>
              )}
            </div>
          </div>
        </DesktopContainer>

        {/* Mobile Layout */}
        <MobileViewContainer showSidebar={showMobileSidebar}>
          {/* Mobile Navigation Bar */}
          <MobileNavBar>
            {!showMobileSidebar && (
              <MobileNavButton onClick={handleBackToNotes}>
                <ArrowLeft size={16} />
                Back to Notes
              </MobileNavButton>
            )}
            {showMobileSidebar && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <List size={20} />
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Notes</span>
              </div>
            )}
            {!showMobileSidebar && selectedNote && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} />
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                  {selectedNote.title || 'Untitled Note'}
                </span>
              </div>
            )}
          </MobileNavBar>

          {/* Mobile Sidebar */}
          <MobileSidebarWrapper isVisible={showMobileSidebar}>
            <NotesSidebar
              notes={notesWithDraft}
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
          </MobileSidebarWrapper>

          {/* Mobile Editor */}
          <MobileEditorWrapper isVisible={!showMobileSidebar}>
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
                fontSize: '1rem',
                padding: '2rem'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
                <h3 style={{ marginBottom: '0.5rem', color: '#495057', textAlign: 'center' }}>No Note Selected</h3>
                <p style={{ margin: 0, textAlign: 'center', lineHeight: '1.5' }}>
                  Go back to notes and select one to view and edit it, or create a new note.
                </p>
              </div>
            )}
          </MobileEditorWrapper>
        </MobileViewContainer>
      </NotesPageContainer>
    </Container>
  );
};

export default NotesPage; 