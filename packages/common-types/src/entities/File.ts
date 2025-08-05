import { FileType } from '../enums/FileType';

export interface File {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  fileType: FileType;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
} 