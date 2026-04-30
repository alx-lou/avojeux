import { GameDefinition } from './types';

export const GAMES: GameDefinition[] = [
  {
    id: 'skyjo',
    name: 'Skyjo',
    description: 'The goal is to collect as few points as possible.',
    icon: 'Layers',
    color: 'emerald',
    tools: ['leaderboard', 'graph']
  },
  {
    id: 'flip7',
    name: 'Flip7',
    description: 'A fast-paced card game of luck and strategy.',
    icon: 'Zap',
    color: 'blue',
    tools: ['leaderboard', 'graph']
  },
  {
    id: 'codenames',
    name: 'Codenames',
    description: 'Social word game of deduction and team play.',
    icon: 'Search',
    color: 'red',
    tools: ['teams', 'graph']
  },
  {
    id: 'custom',
    name: 'Custom Game',
    description: 'Generic tools for any board game.',
    icon: 'Dices',
    color: 'gray',
    tools: ['leaderboard', 'teams', 'graph']
  }
];
