export interface Poll {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
  expiresAt: string;
  totalVotes?: number;
  isClosed: boolean;
  isPrivate: boolean;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
}

export interface PollInvitation {
  id: string;
  pollId: string;
  email: string;
  token: string;
  status: 'PENDING' | 'VOTED' | 'EXPIRED';
  sentAt: string;
  votedAt?: string;
}

export interface SharePollData {
  emails: string[];
  title: string;
}

export interface CreatePollData {
  title: string;
  description: string;
  options: { text: string }[];
  password: string;
  expiresAt: string;
  isPrivate?: boolean;
  emails?: string[];
}

export interface VoteData {
  optionId: string;
  fingerprint: string;
  token?: string;
  hardwareInfo?: {
    screenResolution?: string;
    timezone?: string;
    platform?: string;
    webglVendor?: string;
    webglRenderer?: string;
    hardwareConcurrency?: number;
    deviceMemory?: number;
    colorDepth?: number;
    touchPoints?: number;
    languages?: string;
  };
} 