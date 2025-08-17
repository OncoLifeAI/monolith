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
    onDelete && onDelete(note.entry_uuid || note.id || '');
  };

  // Format the date for display (shows last modified date and time)
  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recent';
    }
  };



  return (
    <NoteItemContainer 
      isSelected={isSelected}
      onClick={onSelect}
    >
      <NoteTitle title={note.title || 'Untitled Note'}>
        {note.title || 'Untitled Note'}
      </NoteTitle>
      <NotePreview title={note.diary_entry || 'No content available...'}>
        {note.diary_entry || 'No content available...'}
      </NotePreview>
      <NoteDate>
        {formatDisplayDate(note.last_updated_at || note.created_at || new Date().toISOString())}
      </NoteDate>
      
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