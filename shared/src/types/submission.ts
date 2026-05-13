export interface SubmissionItem {
  tool: string;       // the item key from template
  details: string;    // user's response
}

export interface MediaAttachment {
  fileId: string;
  type: 'photo' | 'video';
}

export type SubmissionStatus = 'open' | 'reviewed';

export interface Submission {
  _id: string;
  projectId: string;
  templateId: string;
  templateName: string;
  userId: string;
  username: string;
  items: SubmissionItem[];
  media: MediaAttachment[];
  status: SubmissionStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
