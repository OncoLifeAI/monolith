import React, { useState, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { EditorContainer, EditorHeader, EditorContent, EditorHeading, SaveButton, DeleteButton, CancelButton } from './NoteEditor.styles';
import type { Note } from '../types';

interface NoteEditorProps {
  note: Note;
  onNoteUpdate: (note: Note) => void;
  onSaveNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  isDraft?: boolean;
  onCancelDraft?: () => void;
  forceEdit?: boolean;
  onForceEditHandled?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onNoteUpdate, onSaveNote, onDeleteNote, isDraft, onCancelDraft, forceEdit, onForceEditHandled }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.diary_entry);
  const [isEditing, setIsEditing] = useState(false);

  const titleInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node && isEditing && lastEditField === 'title') {
      node.focus();
    }
  }, [isEditing]);

  const contentTextareaRef = useCallback((node: HTMLTextAreaElement | null) => {
    if (node && isEditing && lastEditField === 'content') {
      node.focus();
    }
  }, [isEditing]);

  const [lastEditField, setLastEditField] = useState<'title' | 'content' | null>(null);

  const handleTitleClick = () => {
    setIsEditing(true);
    setLastEditField('title');
  };

  const handleContentClick = () => {
    setIsEditing(true);
    setLastEditField('content');
  };

  const handleSave = () => {
    const updatedNote: Note = {
      ...note,
      title,
      diary_entry: content,
      // preview: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    };
    onNoteUpdate(updatedNote);
    
    if (!note.id) {
      onSaveNote(updatedNote);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isDraft && onCancelDraft) {
      onCancelDraft();
    } else {
      setTitle(note.title);
      setContent(note.diary_entry);
      setIsEditing(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <EditorContainer>
      <EditorHeader>
        {isEditing ? (
          <>
            <EditorHeading>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="fw-bold fs-3"
                style={{ width: '100%', border: 'none', padding: 0, backgroundColor: 'transparent', fontSize: '2rem', fontWeight: 700 }}
                ref={titleInputRef}
              />
            </EditorHeading>
          </>
        ) : (
          <EditorHeading onClick={handleTitleClick} style={{ cursor: 'pointer' }}>
            {title}
          </EditorHeading>
        )}
      </EditorHeader>

      <EditorContent>
        {isEditing ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Form.Control
              as="textarea"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your note..."
              style={{ 
                border: 'none', 
                resize: 'none', 
                fontSize: '1rem', 
                width: '100%', 
                flex: 1,
                overflow: 'hidden'
              }}
              ref={contentTextareaRef}
            />
          </div>
        ) : (
          <div 
            onClick={handleContentClick}
            style={{ 
              cursor: 'pointer',
              height: '100%',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6'
            }}
          >
            {content || 'Click to start writing...'}
          </div>
        )}
      </EditorContent>
      {isEditing && (
        <div style={{ 
          position: 'absolute', 
          bottom: '2rem', 
          right: '2rem', 
          zIndex: 1000,
          display: 'flex',
          gap: '1rem'
        }}>
          <CancelButton
            onClick={handleCancel}
          >
            Cancel
          </CancelButton>
          {!isDraft && (
            <DeleteButton
              onClick={() => onDeleteNote && onDeleteNote(note.id || '')}
            >
              Delete
            </DeleteButton>
          )}
          <SaveButton
            onClick={handleSave}
          >
            Save
          </SaveButton>
        </div>
      )}
    </EditorContainer>
  );
}; 