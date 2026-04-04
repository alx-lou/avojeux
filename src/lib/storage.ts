import { AppState, Player, GameSession } from '../types';

const STORAGE_KEY = 'tabletop_toolbox_data';

const DEFAULT_STATE: AppState = {
  players: [],
  sessions: [],
};

export const storage = {
  save: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  load: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_STATE;
    }
  },
};
