export interface Poll {
  id: string
  title: string
  description: string
  options: PollOption[]
  createdAt: Date
  expiresAt: Date
  totalVotes?: number
  settings?: {
    showResults: boolean
    allowMultipleVotes: boolean
  }
}

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface CreatePollData {
  title: string
  description?: string
  options: { text: string }[]
  expiresAt: string
  password: string
  settings?: {
    showResults: boolean
    allowMultipleVotes: boolean
  }
}

export interface VoteData {
  pollId: string
  optionId: string
}

export interface DeletePollData {
  pollId: string
  password: string
} 