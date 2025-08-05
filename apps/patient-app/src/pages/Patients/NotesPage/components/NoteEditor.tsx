import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import styled from 'styled-components';
import type { Note } from '@patient-portal/common-types';

interface NoteEditorProps {
  note?: Note;
  onNoteUpdate: (note: Note) => void;
  onSaveNote: (note: Partial<Note>) => void;
  onDeleteNote: (noteId: string) => void;
  isDraft?: boolean;
  onCancelDraft?: () => void;
}

const EditorContainer = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
`;

const EditorHeading = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const EditorInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  background: transparent;
  
  &::placeholder {
    color: #999;
  }
`;

const EditorContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const EditorTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  background: transparent;
  resize: none;
  
  &::placeholder {
    color: #999;
  }
`;

const SaveButton = styled(Button)`
  background-color: #007bff;
  color: white;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const CancelButton = styled(Button)`
  background-color: #6c757d;
  color: white;
  
  &:hover {
    background-color: #545b62;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #dc3545;
  color: white;
  
  &:hover {
    background-color: #c82333;
  }
`;

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onNoteUpdate, 
  onSaveNote, 
  onDeleteNote, 
  isDraft, 
  onCancelDraft 
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note]);

  const handleSave = () => {
    if (!note?.id) {
      // This is a new note, we need to provide required fields
      const newNote: Partial<Note> = {
        title,
        content,
        patientId: '', // This should be provided by the parent component
        status: 'draft' as any, // This should be provided by the parent component
        priority: 'low' as any, // This should be provided by the parent component
      };
      onSaveNote(newNote);
    } else {
      // This is an existing note
      const updatedNote: Note = {
        ...note,
        title,
        content,
      };
      onNoteUpdate(updatedNote);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isDraft && onCancelDraft) {
      onCancelDraft();
    } else {
      setTitle(note?.title || '');
      setContent(note?.content || '');
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
              <EditorInput
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTitleChange(e.target.value)}
                placeholder="Title"
                autoFocus
              />
            </EditorHeading>
          </>
        ) : (
          <EditorHeading onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', width: '100%' }}>
            <EditorInput
              type="text"
              value={title}
              readOnly
              style={{ background: '#f8f9fa', cursor: 'pointer' }}
            />
          </EditorHeading>
        )}
      </EditorHeader>

      <EditorContent>
        {isEditing ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <EditorTextarea
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleContentChange(e.target.value)}
              placeholder="Start writing your note..."
              autoFocus
            />
          </div>
        ) : (
          <div onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', height: '100%' }}>
            <EditorTextarea
              value={content || 'Click to start writing...'}
              readOnly
              style={{ background: '#f8f9fa', cursor: 'pointer', minHeight: 200 }}
            />
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
              onClick={() => onDeleteNote && onDeleteNote(note?.id || '')}
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