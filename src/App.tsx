import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  CATEGORIES,
  QUESTIONS,
  DIY_STEPS,
  GAME_RULES,
  Category,
} from "./data/cards";
import SpinningWheel from "./components/SpinningWheel";
import DrawingCanvas from "./components/DrawingCanvas";
import PrintStudio from "./components/PrintStudio";
import {
  Sparkles,
  User,
  HelpCircle,
  Trophy,
  Heart,
  Compass,
  Coins,
  BookOpen,
  Layout,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  PlusCircle,
  MinusCircle,
  Check,
  AlertCircle,
  ArrowRight,
  Printer,
  ChevronRight,
  CheckCircle2,
  Eye,
  Trash2,
  Users,
} from "lucide-react";

// Types for players in digital companion
interface Player {
  id: string;
  name: string;
  age: string;
  emoji: string;
  tokens: number;
}

interface GameLog {
  id: string;
  text: string;
  timestamp: string;
}

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"game" | "rules" | "cards" | "print">("game");

  // Sound effects enabled state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Digital Companion State
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Máma", age: "Dospělá", emoji: "👩‍🦰", tokens: 10 },
    { id: "2", name: "Táta", age: "Dospělý", emoji: "👨‍🦱", tokens: 10 },
    { id: "3", name: "Dcera", age: "10 let", emoji: "👧", tokens: 10 },
    { id: "4", name: "Syn", age: "7 let", emoji: "👦", tokens: 10 },
  ]);

  // Player creation inputs
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerAge, setNewPlayerAge] = useState("");
  const [newPlayerEmoji, setNewPlayerEmoji] = useState("🦊");

  // Active game cycle state
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [gameState, setGameState] = useState<"turn_selection" | "spinning" | "card_revealed" | "betting" | "scoring" | "game_over">("turn_selection");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [usedQuestions, setUsedQuestions] = useState<Record<string, number[]>>({
    zlate_vzpominky: [],
    moje_super_ja: [],
    co_by_bylo_kdyby: [],
    rodinna_vyzva: [],
    tajne_sny: [],
  });

  // Betting / Scoring State
  const [playerBets, setPlayerBets] = useState<Record<string, number>>({});
  const [playerScores, setPlayerScores] = useState<Record<string, boolean>>({});
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);

  // Card list filter
  const [selectedCardCategory, setSelectedCardCategory] = useState<string>("all");

  // custom cards state
  const [customCards, setCustomCards] = useState<Record<string, string[]>>({
    zlate_vzpominky: [],
    moje_super_ja: [],
    co_by_bylo_kdyby: [],
    rodinna_vyzva: [],
    tajne_sny: [],
  });
  const [newCustomCardText, setNewCustomCardText] = useState("");
  const [newCustomCardCategory, setNewCustomCardCategory] = useState("zlate_vzpominky");

  // Load state or logs on start
  useEffect(() => {
    addLog("Vítejte ve hře Naše rodinná jízda! Hráči dostali po 10 žetonech do začátku.");
  }, []);

  const addLog = (text: string) => {
    const newLog: GameLog = {
      id: Math.random().toString(),
      text,
      timestamp: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setGameLogs((prev) => [newLog, ...prev]);
  };

  // Sound synthesizer for clicks and wins
  const playSynthesizedSound = (type: "click" | "win" | "lose" | "fanfare") => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "win") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "lose") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "fanfare") {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // Add a new custom player
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const player: Player = {
      id: Math.random().toString(),
      name: newPlayerName.trim(),
      age: newPlayerAge || "Zvědavý hráč",
      emoji: newPlayerEmoji,
      tokens: 10,
    };
    setPlayers((prev) => [...prev, player]);
    addLog(`Hráč ${player.emoji} ${player.name} se připojil do hry se 10 žetony.`);
    setNewPlayerName("");
    setNewPlayerAge("");
    playSynthesizedSound("click");
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) {
      alert("Hra vyžaduje alespoň 2 hráče!");
      return;
    }
    const removed = players.find((p) => p.id === id);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (removed) {
      addLog(`Hráč ${removed.emoji} ${removed.name} opustil hru.`);
    }
    playSynthesizedSound("click");
  };

  // Trigger spinning state
  const handleStartSpin = () => {
    setGameState("spinning");
    playSynthesizedSound("click");
  };

  // Handle spin completion and draw a card
  const handleSpinComplete = (category: Category) => {
    setSelectedCategory(category);
    
    // Pool together standard and custom questions for this category
    const standardPool = QUESTIONS[category.id] || [];
    const customPool = customCards[category.id] || [];
    const fullPool = [...standardPool, ...customPool];

    // Find unused question
    const usedList = usedQuestions[category.id] || [];
    let chosenIndex = 0;

    if (usedList.length >= fullPool.length) {
      // Reset used questions list for this category if all cards have been drawn
      setUsedQuestions((prev) => ({ ...prev, [category.id]: [] }));
      chosenIndex = Math.floor(Math.random() * fullPool.length);
      setUsedQuestions((prev) => ({ ...prev, [category.id]: [chosenIndex] }));
    } else {
      // Filter out indices that are already used
      const availableIndices = fullPool
        .map((_, i) => i)
        .filter((i) => !usedList.includes(i));
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      chosenIndex = availableIndices[randomIndex];
      setUsedQuestions((prev) => ({
        ...prev,
        [category.id]: [...usedList, chosenIndex],
      }));
    }

    setCurrentQuestion(fullPool[chosenIndex]);
    setGameState("card_revealed");

    // Initialize bets & scores
    const activePlayer = players[activePlayerIndex];
    const initialBets: Record<string, number> = {};
    const initialScores: Record<string, boolean> = {};
    players.forEach((p) => {
      if (p.id !== activePlayer.id) {
        initialBets[p.id] = 1; // Default minimum bet
        initialScores[p.id] = true; // Default to correct guess
      }
    });
    setPlayerBets(initialBets);
    setPlayerScores(initialScores);

    addLog(`Ruleta vylosovala téma: ${category.title}. Aktivní hráč: ${activePlayer.emoji} ${activePlayer.name}.`);
  };

  const handleRevealConfirm = () => {
    setGameState("betting");
    playSynthesizedSound("click");
  };

  const handleBetAdjust = (playerId: string, increment: boolean) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    const currentBet = playerBets[playerId] || 1;
    let newBet = increment ? currentBet + 1 : currentBet - 1;

    // Bet range validation (1 to 3 tokens, cannot exceed player's balance)
    newBet = Math.max(1, Math.min(3, newBet));
    newBet = Math.min(newBet, player.tokens);

    setPlayerBets((prev) => ({ ...prev, [playerId]: newBet }));
    playSynthesizedSound("click");
  };

  const togglePlayerScore = (playerId: string) => {
    setPlayerScores((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
    playSynthesizedSound("click");
  };

  // Process bets and distribute tokens
  const handleProcessScoring = () => {
    const activePlayer = players[activePlayerIndex];
    let totalGuessedRight = 0;
    let totalGuessedWrong = 0;
    let activePlayerBonus = 0;

    const updatedPlayers = players.map((p) => {
      if (p.id === activePlayer.id) {
        // Active player doesn't bet, they might get bonus later
        return p;
      }

      const bet = playerBets[p.id] || 0;
      const isCorrect = playerScores[p.id];

      if (isCorrect) {
        totalGuessedRight++;
        // Gets bet back + same amount from bank
        return { ...p, tokens: p.tokens + bet };
      } else {
        totalGuessedWrong++;
        // Bet goes to bank (lost)
        return { ...p, tokens: Math.max(0, p.tokens - bet) };
      }
    });

    // Check "Otevřená kniha" (Open book) bonus:
    // If EVERY guessing player got it correct, active player gets 2 bonus tokens.
    const guessersCount = players.length - 1;
    let bonusText = "";
    let activePlayerEarned = 0;

    if (totalGuessedRight === guessersCount && guessersCount > 0) {
      activePlayerBonus = 2;
      activePlayerEarned = 2;
      bonusText = ` 🎉 ${activePlayer.emoji} ${activePlayer.name} získává bonus +2 žetony za to, že je "otevřenou knihou"!`;
    }

    // Apply active player tokens
    const finalPlayers = updatedPlayers.map((p) => {
      if (p.id === activePlayer.id) {
        return { ...p, tokens: p.tokens + activePlayerBonus };
      }
      return p;
    });

    setPlayers(finalPlayers);

    // Generate detailed logging text
    let logSummary = `Vyhodnocení kola pro ${activePlayer.name}: `;
    players.forEach((p) => {
      if (p.id !== activePlayer.id) {
        const bet = playerBets[p.id] || 0;
        const isCorrect = playerScores[p.id];
        logSummary += `${p.emoji} ${p.name}: ${isCorrect ? `Uhodl (+${bet})` : `Netrefil (-${bet})`}. `;
      }
    });
    if (bonusText) logSummary += bonusText;

    addLog(logSummary);

    // Play appropriate sounds & confetti
    if (totalGuessedRight > 0) {
      playSynthesizedSound("fanfare");
    } else {
      playSynthesizedSound("lose");
    }

    // Move to next player's turn
    const nextPlayerIndex = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextPlayerIndex);
    setGameState("turn_selection");
  };

  const handleResetGame = () => {
    if (confirm("Opravdu chceš restartovat hru a vynulovat všechny žetony?")) {
      setPlayers(
        players.map((p) => ({ ...p, tokens: 10 }))
      );
      setActivePlayerIndex(0);
      setGameState("turn_selection");
      setSelectedCategory(null);
      setCurrentQuestion("");
      setUsedQuestions({
        zlate_vzpominky: [],
        moje_super_ja: [],
        co_by_bylo_kdyby: [],
        rodinna_vyzva: [],
        tajne_sny: [],
      });
      setPlayerBets({});
      setPlayerScores({});
      setGameLogs([]);
      addLog("Hra byla restartována. Všichni začínají s 10 žetony.");
      playSynthesizedSound("win");
    }
  };

  const handleAddCustomCard = (e: FormEvent) => {
    e.preventDefault();
    if (!newCustomCardText.trim()) return;

    // Check word count constraint
    const words = newCustomCardText.trim().split(/\s+/);
    if (words.length > 12) {
      alert("Otázka je moc dlouhá! Limit je maximálně 12 slov, aby byla srozumitelná.");
      return;
    }

    setCustomCards((prev) => ({
      ...prev,
      [newCustomCardCategory]: [...prev[newCustomCardCategory], newCustomCardText.trim()],
    }));

    addLog(`Přidána nová vlastní karta do kategorie "${CATEGORIES.find((c) => c.id === newCustomCardCategory)?.title}": "${newCustomCardText}"`);
    setNewCustomCardText("");
    playSynthesizedSound("click");
  };

  const handleRemoveCustomCard = (categoryKey: string, cardText: string) => {
    setCustomCards((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((t) => t !== cardText),
    }));
    addLog(`Odstraněna vlastní karta: "${cardText}"`);
    playSynthesizedSound("click");
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "User":
        return <User className="w-5 h-5" />;
      case "HelpCircle":
        return <HelpCircle className="w-5 h-5" />;
      case "Trophy":
        return <Trophy className="w-5 h-5" />;
      case "Heart":
        return <Heart className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Upper Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white font-bold text-xl shadow-md rotate-3 hover:rotate-0 transition-transform">
              🚗
            </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-tight text-slate-900">
                Naše rodinná jízda
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Desková rodinná hra • DIY Edice
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveTab("game");
                playSynthesizedSound("click");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "game"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              🎮 Digitální Společník
            </button>
            <button
              onClick={() => {
                setActiveTab("rules");
                playSynthesizedSound("click");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "rules"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              📜 Pravidla & DIY Výroba
            </button>
            <button
              onClick={() => {
                setActiveTab("cards");
                playSynthesizedSound("click");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "cards"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              💡 Databáze Karet
            </button>
            <button
              onClick={() => {
                setActiveTab("print");
                playSynthesizedSound("click");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "print"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              🖨️ Tiskové Podklady
            </button>
          </nav>

          {/* Sound Control & Reset Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
              title={soundEnabled ? "Vypnout zvuky" : "Zapnout zvuky"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={handleResetGame}
              className="p-2 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all"
              title="Resetovat celou hru"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {/* Mobile View Navigation Tab Helper */}
        <div className="md:hidden flex overflow-x-auto pb-3 mb-4 gap-2 no-scrollbar border-b border-slate-200">
          <button
            onClick={() => setActiveTab("game")}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold ${
              activeTab === "game" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            🎮 Hra
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold ${
              activeTab === "rules" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            📜 Pravidla
          </button>
          <button
            onClick={() => setActiveTab("cards")}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold ${
              activeTab === "cards" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            💡 Karty
          </button>
          <button
            onClick={() => setActiveTab("print")}
            className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold ${
              activeTab === "print" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            🖨️ Tisk
          </button>
        </div>

        {/* Tab 1: Interactive Digital Game companion */}
        {activeTab === "game" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Hand: Player Dashboard & Live Board */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Active Player List & Scores */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    Hráči u stolu
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold uppercase rounded-md">
                    Start: 10 žetonů
                  </span>
                </div>

                <div className="space-y-3">
                  {players.map((player, idx) => {
                    const isActive = idx === activePlayerIndex && gameState !== "turn_selection" && gameState !== "spinning";
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isActive
                            ? "bg-slate-800 border-slate-800 text-white shadow-md ring-2 ring-slate-800/20 scale-102"
                            : idx === activePlayerIndex
                            ? "bg-slate-50 border-slate-300"
                            : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{player.emoji}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold">{player.name}</span>
                              {idx === activePlayerIndex && (
                                <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-bold uppercase animate-pulse">
                                  Aktivní
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] block ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                              Věk: {player.age}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Virtual Tokens counter */}
                          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 px-2.5 py-1 rounded-lg">
                            <Coins className="w-3.5 h-3.5 animate-bounce" />
                            <span className="text-xs font-mono font-bold">{player.tokens}</span>
                          </div>

                          {/* Fast tokens adjuster (no-print) */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setPlayers(
                                  players.map((p) =>
                                    p.id === player.id ? { ...p, tokens: Math.max(0, p.tokens - 1) } : p
                                  )
                                );
                                playSynthesizedSound("click");
                              }}
                              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                              title="Odebrat žeton"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setPlayers(
                                  players.map((p) =>
                                    p.id === player.id ? { ...p, tokens: p.tokens + 1 } : p
                                  )
                                );
                                playSynthesizedSound("click");
                              }}
                              className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                              title="Přidat žeton"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                            {players.length > 2 && (
                              <button
                                onClick={() => handleRemovePlayer(player.id)}
                                className="p-0.5 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 ml-1"
                                title="Odebrat hráče"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Create Custom Player Form */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    + Přidat dalšího člena rodiny
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Jméno (např. Babička)"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="col-span-2 text-xs border border-slate-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50/50"
                    />
                    <select
                      value={newPlayerEmoji}
                      onChange={(e) => setNewPlayerEmoji(e.target.value)}
                      className="text-xs border border-slate-200 p-2 rounded-xl bg-slate-50/50 focus:outline-none"
                    >
                      <option value="👵">👵 Babička</option>
                      <option value="👴">👴 Dědeček</option>
                      <option value="👩">👩 Máma</option>
                      <option value="👨">👨 Táta</option>
                      <option value="👧">👧 Dcera</option>
                      <option value="👦">👦 Syn</option>
                      <option value="👶">👶 Mimčo</option>
                      <option value="🐶">🐶 Pejsek</option>
                      <option value="🐱">🐱 Kočička</option>
                      <option value="🦊">🦊 Liška</option>
                      <option value="🦁">🦁 Lev</option>
                      <option value="🦄">🦄 Jednorožec</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Věk (nepovinné)"
                      value={newPlayerAge}
                      onChange={(e) => setNewPlayerAge(e.target.value)}
                      className="text-xs border border-slate-200 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50/50 flex-1"
                    />
                    <button
                      onClick={handleAddPlayer}
                      disabled={!newPlayerName.trim()}
                      className="bg-slate-800 text-white hover:bg-slate-950 font-semibold px-4 py-2 rounded-xl text-xs transition-all disabled:opacity-40 disabled:hover:bg-slate-800"
                    >
                      Přidat
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Game Logs / Activity List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                <h3 className="font-display font-bold text-slate-800 text-sm">Historie jízdy</h3>
                <div className="h-[140px] overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  {gameLogs.length === 0 ? (
                    <p className="text-[11px] text-slate-400 text-center py-8">Zatím se nic nestalo. Začněte točit!</p>
                  ) : (
                    gameLogs.map((log) => (
                      <div key={log.id} className="text-[10px] leading-relaxed border-b border-slate-100/60 pb-1.5 last:border-0">
                        <span className="font-mono text-slate-400 font-bold mr-1.5">[{log.timestamp}]</span>
                        <span className="text-slate-600 font-medium">{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Right Hand: Wheel, Active Card & Phase Managers */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Header Status */}
              <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider inline-block">
                    Aktivní Hra (Digitální verze)
                  </span>
                  <h2 className="text-xl font-display font-bold text-slate-900 mt-1">
                    Aktuální řidič:{" "}
                    <span className="text-indigo-600">
                      {players[activePlayerIndex]?.emoji} {players[activePlayerIndex]?.name}
                    </span>
                  </h2>
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {gameState === "turn_selection" && "👉 Je na řadě! Zatočte ruletou."}
                  {gameState === "spinning" && "⏳ Ruleta se točí... držte si klobouky!"}
                  {gameState === "card_revealed" && "📖 Otázka vytažena! Zapište/nakreslete tajný tip."}
                  {gameState === "betting" && "🪙 Umístěte sázky a odhalte pravdu!"}
                </div>
              </div>

              {/* Game Phase Controller render */}
              <AnimatePresence mode="wait">
                
                {/* Turn selection -> show spinning wheel! */}
                {(gameState === "turn_selection" || gameState === "spinning") && (
                  <motion.div
                    key="spinning_phase"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-6"
                  >
                    <SpinningWheel
                      isSpinning={gameState === "spinning"}
                      setIsSpinning={(spin) => setGameState(spin ? "spinning" : "turn_selection")}
                      onSpinComplete={handleSpinComplete}
                    />
                  </motion.div>
                )}

                {/* Card revealed -> Active player card flip & answering phase */}
                {gameState === "card_revealed" && selectedCategory && (
                  <motion.div
                    key="card_revealed_phase"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col items-center justify-center py-6">
                      {/* Interactive Flip Card */}
                      <div className="w-full max-w-sm aspect-[2.5/3.5] perspective-1000">
                        <div className="relative w-full h-full duration-700 transform-style-3d shadow-xl rounded-2xl border-4 border-slate-900 overflow-hidden bg-white flex flex-col justify-between p-6">
                          
                          {/* Corner Category Banner */}
                          <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider ${selectedCategory.color}`}>
                              {selectedCategory.title}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">
                              Otázka pro: {players[activePlayerIndex]?.name}
                            </span>
                          </div>

                          {/* Core Question text */}
                          <div className="text-center py-8">
                            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-lg font-display font-bold text-slate-800 leading-snug">
                              "{currentQuestion}"
                            </h4>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                            <span>Naše rodinná jízda</span>
                            <span>{getCategoryIcon(selectedCategory.iconName)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Instruction Box for Drawing Answers */}
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-center max-w-lg mx-auto">
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        💡 <strong>Úkol pro ostatní:</strong> Tajně si napište nebo <strong>nakreslete</strong> na papír svůj odhad o hráči <span className="font-bold">{players[activePlayerIndex]?.name}</span>. Jakmile mají všichni zapsáno, klikněte na tlačítko níže.
                      </p>
                    </div>

                    {/* Optional drawing blackboard in-app for kids */}
                    <div className="max-w-lg mx-auto space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        🎨 Interaktivní tabulka pro kreslení (skvělé pro děti):
                      </span>
                      <DrawingCanvas placeholderText={`Synu, dcery či rodiče! Zde můžete prstem nebo myší nakreslit váš tip pro ${players[activePlayerIndex]?.name}`} />
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleRevealConfirm}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-950 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer hover:translate-x-0.5"
                      >
                        <span>Všichni mají zapsáno, jdeme sázet!</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Betting & Score confirmation screen */}
                {gameState === "betting" && selectedCategory && (
                  <motion.div
                    key="betting_phase"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Tiny info card */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                      <span className="text-2xl">💡</span>
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Otázka na tělo:</span> "{currentQuestion}"
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          Téma: <span className="font-bold">{selectedCategory.title}</span> • Řidič: {players[activePlayerIndex]?.emoji} {players[activePlayerIndex]?.name}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">
                        1. Hádající hráči: Nastavte své sázky (1 až 3 žetony)
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {players.map((player) => {
                          if (player.id === players[activePlayerIndex].id) return null;
                          const currentBet = playerBets[player.id] || 1;
                          const isCorrect = playerScores[player.id];
                          return (
                            <div
                              key={player.id}
                              className={`p-4 rounded-xl border transition-all ${
                                isCorrect
                                  ? "bg-emerald-50/40 border-emerald-200"
                                  : "bg-rose-50/40 border-rose-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{player.emoji}</span>
                                  <div>
                                    <span className="text-xs font-bold text-slate-800 block">{player.name}</span>
                                    <span className="text-[10px] text-slate-400">Žetony: {player.tokens}</span>
                                  </div>
                                </div>

                                {/* Correct vs Incorrect selector */}
                                <button
                                  onClick={() => togglePlayerScore(player.id)}
                                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg transition-all ${
                                    isCorrect
                                      ? "bg-emerald-600 text-white shadow-sm"
                                      : "bg-rose-600 text-white"
                                  }`}
                                >
                                  {isCorrect ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Uhodl(a) ✅</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>Vedle ❌</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Bet counters adjustment */}
                              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100/60">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Vsazené žetony:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleBetAdjust(player.id, false)}
                                    disabled={currentBet <= 1}
                                    className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                                  >
                                    -1
                                  </button>
                                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
                                    {currentBet} 🪙
                                  </span>
                                  <button
                                    onClick={() => handleBetAdjust(player.id, true)}
                                    disabled={currentBet >= 3 || currentBet >= player.tokens}
                                    className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                                  >
                                    +1
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center text-xs text-amber-800 font-medium">
                      📢 <strong>Aktivní hráč odhalí odpověď:</strong> {players[activePlayerIndex]?.name} nyní řekne svou skutečnou, pravdivou odpověď. Označte nahoře u každého hráče, zda uhodl správně (zeleně), nebo vedle (červeně), a stiskněte tlačítko níže k uložení bodů!
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setGameState("card_revealed");
                          playSynthesizedSound("click");
                        }}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
                      >
                        Zpět k otázce
                      </button>
                      <button
                        onClick={handleProcessScoring}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-950 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <span>Vyhodnotit sázky & Další hráč</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>

          </div>
        )}

        {/* Tab 2: Rules and DIY Instructions */}
        {activeTab === "rules" && (
          <div className="space-y-8">
            {/* Header intro card */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="max-w-xl">
                <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  Průvodce hrou
                </span>
                <h2 className="text-2xl font-display font-extrabold mt-2 tracking-tight">
                  Kompletní pravidla hry Naše rodinná jízda
                </h2>
                <p className="text-xs text-amber-50 mt-2 leading-relaxed">
                  Pravidla jsou navržena a vyladěna pro rodiny s dětmi od 7 let. Jsou jednoduchá, nepotřebují složité bodování ani tabulky – vše zvládne i 10letý hráč!
                </p>
              </div>
            </div>

            {/* Rules Breakdown block */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider">
                  Jak hrát krok za krokem
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {GAME_RULES.gameplay.map((step, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 relative">
                    <div className="absolute top-3 right-3 text-2xl font-bold text-amber-500/20 font-mono">
                      #{idx + 1}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* End of Game rule */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                🏁 <strong>Konec hry:</strong> {GAME_RULES.end}
              </div>
            </div>

            {/* DIY Manufacturing steps for the physical version */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DIY_STEPS.map((step, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Compass className="w-5 h-5 text-indigo-500" />
                      {step.title}
                    </h3>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold uppercase px-2 py-0.5 rounded-md">
                      Návod k výrobě
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Potřebný materiál:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {step.materials.map((m, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Postup krok za krokem:
                    </span>
                    <ol className="space-y-2">
                      {step.steps.map((s, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                          <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Complete Question Database Explorer */}
        {activeTab === "cards" && (
          <div className="space-y-6">
            
            {/* Header intro */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-500" />
                  Kompletní databáze 100+ kartiček
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Prohlížej si stávající otázky, filtruj podle herních témat nebo přidej vlastní bláznivé rodinné otázky!
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedCardCategory("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    selectedCardCategory === "all"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Všechny
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCardCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                      selectedCardCategory === c.id
                        ? `${c.color} text-white`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c.color === "bg-white" ? "bg-slate-400" : "bg-white"}`} />
                    {c.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Card Adding Form */}
            <form onSubmit={handleAddCustomCard} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                ✍️ Vytvoř si vlastní otázku pro vaši rodinu
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Např: Kam se nejčastěji schovávám před úklidem pokoje? (max 12 slov)"
                    value={newCustomCardText}
                    onChange={(e) => setNewCustomCardText(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 bg-slate-50/50 font-medium"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 px-1">
                    <span>Odpověď se vždy týká aktivního hráče.</span>
                    <span>Max. 12 slov</span>
                  </div>
                </div>

                <div>
                  <select
                    value={newCustomCardCategory}
                    onChange={(e) => setNewCustomCardCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 p-2.5 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition-all"
                  >
                    Přidat kartičku
                  </button>
                </div>
              </div>
            </form>

            {/* Rendered Questions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((category) => {
                // Filter categories if selected
                if (selectedCardCategory !== "all" && selectedCardCategory !== category.id) return null;

                const standardList = QUESTIONS[category.id] || [];
                const customList = customCards[category.id] || [];

                return (
                  <div key={category.id} className="space-y-4 col-span-1 sm:col-span-2 lg:col-span-3">
                    <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${category.color}`} />
                      {category.title} ({standardList.length + customList.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Custom Added Cards First */}
                      {customList.map((q, idx) => (
                        <div
                          key={`custom-${idx}`}
                          className={`p-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 flex flex-col justify-between h-32 hover:shadow-sm transition-shadow relative`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] font-bold font-mono text-indigo-500 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                              Vlastní karta
                            </span>
                            <button
                              onClick={() => handleRemoveCustomCard(category.id, q)}
                              className="text-slate-400 hover:text-red-500 p-0.5"
                              title="Smazat vlastní kartu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                            "{q}"
                          </p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400">
                            <span>Naše rodinná jízda</span>
                            <span>✏️</span>
                          </div>
                        </div>
                      ))}

                      {/* Standard Built-in Cards */}
                      {standardList.map((q, idx) => (
                        <div
                          key={`std-${idx}`}
                          className="p-4 rounded-xl border border-slate-100 bg-white flex flex-col justify-between h-32 hover:shadow-sm transition-shadow relative"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono font-bold text-slate-400">
                              Karta #{idx + 1}
                            </span>
                            <span className="text-xs">💡</span>
                          </div>
                          <p className="text-xs font-medium text-slate-700 leading-relaxed">
                            "{q}"
                          </p>
                          <div className="flex justify-between items-center text-[9px] text-slate-400">
                            <span>Naše rodinná jízda</span>
                            <span>{getCategoryIcon(category.iconName)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Print & Play Studio Layout */}
        {activeTab === "print" && <PrintStudio />}

      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-slate-400 text-[11px] font-medium no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Naše rodinná jízda © 2026 • Navrženo jako špičkový herní zážitek pro sblížení rodiny.
          </p>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 transition-colors cursor-pointer" onClick={() => setActiveTab("rules")}>
              Návod k výrobě
            </span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer" onClick={() => setActiveTab("print")}>
              Tisk karet
            </span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer" onClick={() => setActiveTab("game")}>
              Pustit hru
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
