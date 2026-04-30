import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Dices, 
  Plus, 
  Trash2, 
  ChevronRight, 
  History, 
  ArrowLeft,
  X,
  UserPlus,
  Zap,
  Layers,
  Search,
  Play,
  LineChart as LineChartIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { cn } from './lib/utils';
import { storage } from './lib/storage';
import { Player, GameSession, AppState, GameDefinition, ToolType } from './types';
import { GAMES } from './constants';

type View = 'dashboard' | 'game-portal' | 'players' | 'session-detail' | 'new-session';

const ICON_MAP: Record<string, any> = {
  Layers,
  Zap,
  Search,
  Dices
};

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [state, setState] = useState<AppState>(() => storage.load());
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    storage.save(state);
  }, [state]);

  const activeGame = useMemo(() => 
    GAMES.find(g => g.id === activeGameId),
    [activeGameId]
  );

  const activeSession = useMemo(() => 
    state.sessions.find(s => s.id === activeSessionId),
    [state.sessions, activeSessionId]
  );

  const gameSessions = useMemo(() => 
    state.sessions.filter(s => s.gameId === activeGameId),
    [state.sessions, activeGameId]
  );

  // Handlers
  const addPlayer = (name: string) => {
    if (!name.trim()) return;
    const newPlayer: Player = { id: crypto.randomUUID(), name };
    setState(prev => ({ ...prev, players: [...prev.players, newPlayer] }));
  };

  const removePlayer = (id: string) => {
    setState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id)
    }));
  };

  const createSession = (game: GameDefinition, selectedPlayerIds: string[]) => {
    const players = state.players.filter(p => selectedPlayerIds.includes(p.id));
    const newSession: GameSession = {
      id: crypto.randomUUID(),
      gameId: game.id,
      gameName: game.name,
      date: new Date().toISOString(),
      players,
      scores: Object.fromEntries(players.map(p => [p.id, 0])),
      roundHistory: Object.fromEntries(players.map(p => [p.id, []])),
      isFinished: false
    };
    setState(prev => ({ ...prev, sessions: [newSession, ...prev.sessions] }));
    setActiveSessionId(newSession.id);
    setView('session-detail');
  };

  const updateScore = (sessionId: string, playerId: string, delta: number) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          scores: {
            ...s.scores,
            [playerId]: (s.scores[playerId] || 0) + delta
          }
        };
      })
    }));
  };

  const addRoundScore = (sessionId: string, playerId: string, roundScore: number) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id !== sessionId) return s;
        const history = s.roundHistory || {};
        const currentHistory = history[playerId] || [];
        return {
          ...s,
          scores: {
            ...s.scores,
            [playerId]: (s.scores[playerId] || 0) + roundScore
          },
          roundHistory: {
            ...history,
            [playerId]: [...currentHistory, roundScore]
          }
        };
      })
    }));
  };

  const updateTeams = (sessionId: string, teams: string[][]) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === sessionId ? { ...s, teams } : s)
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => setView('dashboard')}>
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white shadow-sm cursor-pointer">
            <Dices size={20} />
          </div>
          <h1 className="font-semibold text-lg tracking-tight cursor-pointer">Tabletop Toolbox</h1>
        </div>
        <button 
          onClick={() => setView('players')}
          className="p-2 hover:bg-black/5 rounded-full transition-colors"
        >
          <Users size={20} className="text-gray-600" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Game Portals</h2>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {GAMES.map(game => {
                    const Icon = ICON_MAP[game.icon] || Dices;
                    return (
                      <button 
                        key={game.id}
                        onClick={() => {
                          setActiveGameId(game.id);
                          setView('game-portal');
                        }}
                        className="bg-white p-4 rounded-2xl border border-black/5 flex items-center gap-4 hover:border-emerald-200 transition-all text-left group"
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm",
                          game.color === 'emerald' && "bg-emerald-600",
                          game.color === 'blue' && "bg-blue-600",
                          game.color === 'red' && "bg-red-600",
                          game.color === 'gray' && "bg-gray-600",
                        )}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{game.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-1">{game.description}</p>
                        </div>
                        <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </section>

              {state.sessions.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Recent Activity</h2>
                  </div>
                  <div className="space-y-3">
                    {state.sessions.slice(0, 3).map(session => (
                      <div 
                        key={session.id}
                        onClick={() => {
                          setActiveSessionId(session.id);
                          setView('session-detail');
                        }}
                        className="bg-white p-4 rounded-2xl border border-black/5 flex items-center justify-between hover:border-emerald-200 transition-colors cursor-pointer group"
                      >
                        <div>
                          <h3 className="font-medium">{session.gameName}</h3>
                          <p className="text-xs text-gray-400">
                            {new Date(session.date).toLocaleDateString()} • {session.players.length} players
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {!session.isFinished && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          )}
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {view === 'game-portal' && activeGame && (
            <GamePortalView 
              game={activeGame}
              sessions={gameSessions}
              onNewSession={() => setView('new-session')}
              onOpenSession={(id) => {
                setActiveSessionId(id);
                setView('session-detail');
              }}
              onBack={() => setView('dashboard')}
            />
          )}

          {view === 'players' && (
            <PlayersView 
              players={state.players} 
              onAdd={addPlayer} 
              onRemove={removePlayer} 
              onBack={() => setView('dashboard')} 
            />
          )}

          {view === 'new-session' && activeGame && (
            <NewSessionView 
              game={activeGame}
              players={state.players} 
              onStart={(pids) => createSession(activeGame, pids)} 
              onBack={() => setView('game-portal')} 
            />
          )}

          {view === 'session-detail' && activeSession && (
            <SessionDetailView 
              session={activeSession} 
              game={GAMES.find(g => g.id === activeSession.gameId) || GAMES[GAMES.length - 1]}
              players={state.players}
              onUpdateScore={(pid, delta) => updateScore(activeSession.id, pid, delta)}
              onAddRoundScore={(pid, score) => addRoundScore(activeSession.id, pid, score)}
              onUpdateTeams={(teams) => updateTeams(activeSession.id, teams)}
              onBack={() => {
                setActiveGameId(activeSession.gameId);
                setView('game-portal');
              }}
              onFinish={() => {
                setState(prev => ({
                  ...prev,
                  sessions: prev.sessions.map(s => s.id === activeSession.id ? { ...s, isFinished: true } : s)
                }));
                setView('dashboard');
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function GamePortalView({ game, sessions, onNewSession, onOpenSession, onBack }: { 
  game: GameDefinition, 
  sessions: GameSession[], 
  onNewSession: () => void, 
  onOpenSession: (id: string) => void,
  onBack: () => void 
}) {
  const Icon = ICON_MAP[game.icon] || Dices;
  const ongoing = sessions.filter(s => !s.isFinished);
  const finished = sessions.filter(s => s.isFinished);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full"><ArrowLeft size={20} /></button>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-white",
            game.color === 'emerald' && "bg-emerald-600",
            game.color === 'blue' && "bg-blue-600",
            game.color === 'red' && "bg-red-600",
            game.color === 'gray' && "bg-gray-600",
          )}>
            <Icon size={18} />
          </div>
          <h2 className="text-xl font-bold">{game.name} Portal</h2>
        </div>
      </div>

      <button 
        onClick={onNewSession}
        className="w-full bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group"
      >
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play size={24} fill="currentColor" />
        </div>
        <span className="font-bold text-emerald-700">Start New Session</span>
      </button>

      {ongoing.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Ongoing</h3>
          <div className="space-y-2">
            {ongoing.map(s => (
              <button 
                key={s.id}
                onClick={() => onOpenSession(s.id)}
                className="w-full bg-white p-4 rounded-xl border border-emerald-100 flex items-center justify-between hover:shadow-sm transition-all"
              >
                <div className="text-left">
                  <p className="font-medium">{new Date(s.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{s.players.length} players</p>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  Resume <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">History</h3>
          <div className="space-y-2">
            {finished.map(s => (
              <button 
                key={s.id}
                onClick={() => onOpenSession(s.id)}
                className="w-full bg-white p-4 rounded-xl border border-black/5 flex items-center justify-between opacity-70 hover:opacity-100 transition-all"
              >
                <div className="text-left">
                  <p className="font-medium">{new Date(s.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-400">{s.players.length} players</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}

function PlayersView({ players, onAdd, onRemove, onBack }: { players: Player[], onAdd: (n: string) => void, onRemove: (id: string) => void, onBack: () => void }) {
  const [name, setName] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold">Manage Players</h2>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-black/5 space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Player name..."
            className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            onKeyDown={e => e.key === 'Enter' && (onAdd(name), setName(''))}
          />
          <button 
            onClick={() => { onAdd(name); setName(''); }}
            className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {players.length === 0 ? (
            <p className="text-center py-8 text-gray-400 text-sm">No players added yet.</p>
          ) : (
            players.map(player => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group">
                <span className="font-medium">{player.name}</span>
                <button 
                  onClick={() => onRemove(player.id)}
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NewSessionView({ game, players, onStart, onBack }: { game: GameDefinition, players: Player[], onStart: (pids: string[]) => void, onBack: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const togglePlayer = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full"><ArrowLeft size={20} /></button>
        <h2 className="text-xl font-bold">New {game.name} Session</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-black/5 space-y-6">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">Select Players</label>
          <div className="grid grid-cols-2 gap-2">
            {players.map(player => (
              <button
                key={player.id}
                onClick={() => togglePlayer(player.id)}
                className={cn(
                  "p-3 rounded-xl border text-sm font-medium transition-all text-left",
                  selected.includes(player.id) 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-gray-50 border-transparent text-gray-600 hover:border-gray-200"
                )}
              >
                {player.name}
              </button>
            ))}
          </div>
          {players.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Add players in settings first.</p>
          )}
        </div>

        <button
          disabled={selected.length === 0}
          onClick={() => onStart(selected)}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Initialize Game
        </button>
      </div>
    </motion.div>
  );
}

function SessionDetailView({ 
  session, 
  game, 
  players,
  onUpdateScore, 
  onAddRoundScore,
  onUpdateTeams,
  onBack, 
  onFinish 
}: { 
  session: GameSession, 
  game: GameDefinition,
  players: Player[],
  onUpdateScore: (pid: string, d: number) => void, 
  onAddRoundScore: (pid: string, score: number) => void,
  onUpdateTeams: (teams: string[][]) => void,
  onBack: () => void, 
  onFinish: () => void 
}) {
  const [activeTool, setActiveTool] = useState<ToolType>(game.tools[0]);
  const [scoringPlayerId, setScoringPlayerId] = useState<string | null>(null);
  
  // Sequential round scoring state
  const [activeRoundPlayerIndex, setActiveRoundPlayerIndex] = useState<number | null>(null);

  const sortedPlayers = [...session.players].sort((a, b) => (session.scores[b.id] || 0) - (session.scores[a.id] || 0));

  const currentScoringPlayer = useMemo(() => {
    if (activeRoundPlayerIndex !== null) {
      return session.players[activeRoundPlayerIndex];
    }
    return session.players.find(p => p.id === scoringPlayerId);
  }, [session.players, scoringPlayerId, activeRoundPlayerIndex]);

  const startRound = () => {
    setActiveRoundPlayerIndex(0);
  };

  const handleScoreAdd = (val: number) => {
    if (currentScoringPlayer) {
      onAddRoundScore(currentScoringPlayer.id, val);
      
      if (activeRoundPlayerIndex !== null) {
        if (activeRoundPlayerIndex < session.players.length - 1) {
          setActiveRoundPlayerIndex(activeRoundPlayerIndex + 1);
        } else {
          setActiveRoundPlayerIndex(null);
        }
      } else {
        setScoringPlayerId(null);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-black/5 rounded-full"><ArrowLeft size={20} /></button>
          <div>
            <h2 className="text-xl font-bold leading-tight">{session.gameName}</h2>
            <p className="text-xs text-gray-400">{new Date(session.date).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!session.isFinished && game.id === 'flip7' && activeRoundPlayerIndex === null && (
            <button 
              onClick={startRound}
              className="text-xs font-bold text-white bg-emerald-600 px-4 py-1.5 rounded-full hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Start Round
            </button>
          )}
          {!session.isFinished && (
            <button 
              onClick={onFinish}
              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
            >
              Finish Game
            </button>
          )}
        </div>
      </div>

      {/* Tool Switcher if multiple tools */}
      {game.tools.length > 1 && (
        <div className="flex p-1 bg-gray-100 rounded-xl">
          {game.tools.map(tool => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              className={cn(
                "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                activeTool === tool ? "bg-white shadow-sm text-emerald-600" : "text-gray-400"
              )}
            >
              {tool}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {(activeRoundPlayerIndex !== null || scoringPlayerId) && currentScoringPlayer ? (
          <motion.div
            key="focused-scorer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative">
              {game.id === 'flip7' ? (
                <Flip7FocusedScorer 
                  player={currentScoringPlayer}
                  playerProgress={`${(activeRoundPlayerIndex ?? 0) + 1}/${session.players.length}`}
                  onAddScore={handleScoreAdd}
                  onCancel={() => {
                    setActiveRoundPlayerIndex(null);
                    setScoringPlayerId(null);
                  }}
                />
              ) : (
                <div className="p-8 space-y-6">
                   <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">Score for {currentScoringPlayer.name}</h3>
                      <p className="text-gray-400 text-sm">Add points manually</p>
                    </div>
                    <button onClick={() => { setActiveRoundPlayerIndex(null); setScoringPlayerId(null); }} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 5, 10, 20, 50, -1].map(val => (
                      <button
                        key={val}
                        onClick={() => handleScoreAdd(val)}
                        className={cn(
                          "py-4 rounded-2xl font-bold text-lg transition-all active:scale-95",
                          val > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}
                      >
                        {val > 0 ? `+${val}` : val}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="leaderboard-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {activeTool === 'leaderboard' && (
              <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                  <div 
                    key={player.id}
                    onClick={() => !session.isFinished && setScoringPlayerId(player.id)}
                    className={cn(
                      "bg-white p-5 rounded-2xl border border-black/5 flex flex-col gap-3 transition-all cursor-pointer hover:border-emerald-200 shadow-sm",
                      index === 0 && !session.isFinished && "ring-2 ring-amber-400 ring-offset-2 shadow-amber-100"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{player.name}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {session.roundHistory?.[player.id]?.slice(-5).map((score, i) => (
                              <span key={i} className="text-[10px] font-mono text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded border border-black/5">
                                {score}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-mono font-black text-emerald-600">
                          {session.scores[player.id] || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTool === 'teams' && (
              <TeamGeneratorComponent 
                players={session.players} 
                existingTeams={session.teams}
                onTeamsGenerated={onUpdateTeams}
                isFinished={session.isFinished}
              />
            )}

            {activeTool === 'graph' && (
              <ScoreProgressionChart 
                session={session}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Flip7FocusedScorer({ 
  player, 
  playerProgress,
  onAddScore, 
  onCancel 
}: { 
  player: Player, 
  playerProgress: string,
  onAddScore: (val: number) => void, 
  onCancel: () => void 
}) {
  const [manualValue, setManualValue] = useState<string>('');
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [bonuses, setBonuses] = useState<number[]>([]);

  // Reset state when focusing a new player
  useEffect(() => {
    setManualValue('');
    setSelectedCards([]);
    setMultiplier(1);
    setBonuses([]);
  }, [player.id]);

  const toggleCard = (num: number) => {
    setSelectedCards(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const toggleBonus = (val: number) => {
    setBonuses(prev => prev.includes(val) ? prev.filter(n => n !== val) : [...prev, val]);
  };

  const toggleMultiplier = () => {
    setMultiplier(prev => prev === 2 ? 1 : 2);
  };

  const baseSum = selectedCards.reduce((acc, curr) => acc + curr, 0);
  const bonusSum = bonuses.reduce((acc, curr) => acc + curr, 0);
  const manualTotal = parseInt(manualValue) || 0;
  
  const totalToAdd = (baseSum + bonusSum + manualTotal) * multiplier;

  return (
    <div className="flex flex-col h-[85vh] max-h-[700px]">
      <div className="p-6 pb-2 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h3 className="text-2xl font-black">{player.name}</h3>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{playerProgress} Players Scoring</p>
        </div>
        <button onClick={onCancel} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {/* Card Grid */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Cards (1-12)</label>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => toggleCard(num)}
                className={cn(
                  "aspect-square rounded-2xl border-2 font-black text-lg transition-all",
                  selectedCards.includes(num) 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Bonus Grid */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Bonuses</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={toggleMultiplier}
              className={cn(
                "py-3 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-1",
                multiplier === 2 
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100" 
                  : "bg-white border-orange-100 text-orange-500 hover:border-orange-200"
              )}
            >
              x2
            </button>
            {[2, 4, 6, 8, 10].map(val => (
              <button
                key={val}
                onClick={() => toggleBonus(val)}
                className={cn(
                  "py-3 rounded-xl border-2 font-black transition-all flex items-center justify-center",
                  bonuses.includes(val) 
                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100" 
                    : "bg-white border-orange-100 text-orange-500 hover:border-orange-200"
                )}
              >
                +{val}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Entry */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 ml-1">Manual Points</label>
          <input 
            type="number" 
            value={manualValue}
            onChange={e => setManualValue(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-50 border-none rounded-2xl p-4 text-center text-xl font-black focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
          />
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total this turn</span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-emerald-600">{totalToAdd}</span>
            <span className="text-gray-400 font-bold">pts</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onAddScore(0)}
            className="bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold transition-all active:scale-95 hover:bg-gray-200"
          >
            Skip Turn
          </button>
          <button
            onClick={() => onAddScore(totalToAdd)}
            className="bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95"
          >
            Record
          </button>
        </div>
      </div>
    </div>
  );
}

function ScoreProgressionChart({ session }: { session: GameSession }) {
  const data = useMemo(() => {
    const maxRounds = Math.max(...Object.values(session.roundHistory || {}).map(h => h.length), 0);
    const chartData = [];

    // Initial state (Round 0)
    const initialRound: any = { name: 'Start' };
    session.players.forEach(p => {
      initialRound[p.name] = 0;
    });
    chartData.push(initialRound);

    // Cumulative sums per round
    const cumulativeScores: Record<string, number> = {};
    session.players.forEach(p => {
      cumulativeScores[p.id] = 0;
    });

    for (let i = 0; i < maxRounds; i++) {
      const roundData: any = { name: `R${i + 1}` };
      session.players.forEach(p => {
        const roundScore = session.roundHistory?.[p.id]?.[i] || 0;
        cumulativeScores[p.id] += roundScore;
        roundData[p.name] = cumulativeScores[p.id];
      });
      chartData.push(roundData);
    }
    return chartData;
  }, [session.roundHistory, session.players]);

  const colors = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Score Progression</h3>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }} 
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
            {session.players.map((p, i) => (
              <Line 
                key={p.id} 
                type="monotone" 
                dataKey={p.name} 
                stroke={colors[i % colors.length]} 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: colors[i % colors.length] }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TeamGeneratorComponent({ players, existingTeams, onTeamsGenerated, isFinished }: { 
  players: Player[], 
  existingTeams?: string[][], 
  onTeamsGenerated: (t: string[][]) => void,
  isFinished: boolean
}) {
  const [numTeams, setNumTeams] = useState(2);

  const generateTeams = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const result: string[][] = Array.from({ length: numTeams }, () => []);
    shuffled.forEach((p, i) => {
      result[i % numTeams].push(p.name);
    });
    onTeamsGenerated(result);
  };

  const teamsToDisplay = existingTeams || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-black/5 space-y-6">
      {!isFinished && (
        <>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">Number of Teams</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="2" 
                max="6" 
                value={numTeams}
                onChange={e => setNumTeams(parseInt(e.target.value))}
                className="flex-1 accent-emerald-600"
              />
              <span className="font-bold text-lg w-8 text-center">{numTeams}</span>
            </div>
          </div>

          <button
            onClick={generateTeams}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
          >
            {existingTeams ? 'Regenerate Teams' : 'Generate Teams'}
          </button>
        </>
      )}

      {teamsToDisplay.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-black/5">
          {teamsToDisplay.map((team, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Team {i + 1}</h4>
              <div className="flex flex-wrap gap-2">
                {team.map((name, j) => (
                  <span key={j} className="bg-white px-3 py-1 rounded-full text-sm font-medium border border-black/5 shadow-sm">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
