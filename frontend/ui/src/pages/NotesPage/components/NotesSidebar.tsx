import React from 'react';
import { Plus } from 'lucide-react';
import { AddNewButton } from '../NotesPage.styles';
import { NoteItem } from './NoteItem';
import { SidebarContainer, SidebarHeader, NotesList, NotesSidebarTitle } from './NotesSidebar.styles';
import SharedDatePicker from '../../../components/DatePicker';
import type { Note } from '../types';
import type { Dayjs } from 'dayjs';

interface NotesSidebarProps {
  notes: Note[];
  selectedNoteId: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNoteSelect: (noteId: string) => void;
  onAddNote: () => void;
  onDeleteNote?: (noteId: string) => void;
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notes,
  selectedNoteId,
  searchTerm,
  onSearchChange,
  onNoteSelect,
  onAddNote,
  onDeleteNote,
  selectedDate,
  setSelectedDate
}) => {
  return (
    <SidebarContainer>
      <SidebarHeader>
        <SharedDatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          fullWidth={true}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '1rem' }}>
          <NotesSidebarTitle>All Notes</NotesSidebarTitle>
          <AddNewButton onClick={onAddNote}>
            <Plus size={16} />
            Add New
          </AddNewButton>
        </div>
        <input
          type="text"
          placeholder="Search Notes"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </SidebarHeader>

      <NotesList>
        {notes.map((note) => {
          return (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={() => onNoteSelect(note.id || '')}
              onDelete={onDeleteNote}
            />
          );
        })}
      </NotesList>
    </SidebarContainer>
  );
}; 