export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  title: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  isClosed: boolean;
  expiresAt: Date; // Nouveau champ pour la date d'expiration
}
