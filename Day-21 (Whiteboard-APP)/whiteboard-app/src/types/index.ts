export interface FILE {
  _id: string;
  fileName: string;
  whiteboard?: string;
  createdBy: string;
  createdAt: string;
  archived: boolean;
  document?: string;
  teamId?: string;
}

export interface CanvasProps {
  onSaveTrigger: boolean;
  fileId: string;
  fileData: FILE;
}
