import React from 'react';
import { Trash2 } from 'lucide-react';
import { 
  NoteItemContainer, 
  NoteTitle, 
  NotePreview, 
  NoteDate, 
  NoteActions, 
  ActionButton 
} from './NoteItem.styles';
import type { Note } from '../types';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: (noteId: string) => void;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note, isSelected, onSelect, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete && onDelete(note.id || '');
  };

  // Format the date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <NoteItemContainer 
      isSelected={isSelected}
      onClick={onSelect}
    >
      <NoteTitle>{note.title || 'Untitled Note'}</NoteTitle>
      <NotePreview>{note.diary_entry || 'No content available...'}</NotePreview>
      <NoteDate>{formatDate(note.date_created || new Date().toISOString())}</NoteDate>
      
      {onDelete && (
        <NoteActions>
          <ActionButton onClick={handleDelete} title="Delete note">
            <Trash2 size={14} />
          </ActionButton>
        </NoteActions>
      )}
    </NoteItemContainer>
  );
}; 