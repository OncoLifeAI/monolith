export interface Note {
  id?: string;
  title: string;
  diary_entry: string;
  created_at: string;
  last_updated_at?: string; // Make optional since backend might not send it
  entry_uuid?: string;
  marked_for_doctor?: boolean;
} 

export interface NoteResponse {
  data: Note[];
  success: boolean;
  error: string;
  status: number;
}