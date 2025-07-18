import React from 'react';
import { Plus } from 'lucide-react';
import { AddNewButton } from '../NotesPage.styles';
import { NoteItem } from './NoteItem';
import { SidebarContainer, NotesList } from './NotesSidebar.styles';
import type { Note } from '../types';

interface NotesSidebarProps {
  notes: Note[];
  selectedNoteId: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNoteSelect: (noteId: string) => void;
  onAddNote: () => void;
  onDeleteNote?: (noteId: string) => void;
}

export const NotesSidebar: React.FC<NotesSidebarProps> = ({
  notes,
  selectedNoteId,
  searchTerm,
  onSearchChange,
  onNoteSelect,
  onAddNote,
  onDeleteNote
}) => {
  return (
    <SidebarContainer>
      <div style={{ padding: '1rem', borderBottom: '1px solid #e9ecef' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button 
            style={{ 
              background: '#f8f9fa', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            All Notes
          </button>
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
      </div>

      <NotesList>
        {notes.map((note) => {
          return (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={() => onNoteSelect(note.id)}
              onDelete={onDeleteNote}
            />
          );
        })}
      </NotesList>
    </SidebarContainer>
  );
}; 