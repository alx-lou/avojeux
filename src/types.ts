export type ToolType = 'leaderboard' | 'teams' | 'timer' | 'dice';

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  color: string;
  tools: ToolType[];
}

export interface Player {
  id: string;
  name: string;
}

export interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  date: string;
  players: Player[];
  scores: Record<string, number>; // playerId -> total score
  roundHistory: Record<string, number[]>; // playerId -> array of round scores
  isFinished: boolean;
  teams?: string[][]; // For games like Codenames
}

export interface AppState {
  players: Player[];
  sessions: GameSession[];
}
