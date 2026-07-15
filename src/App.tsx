import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
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
  Send,
  MessageSquare,
  Share2,
  Globe,
  RefreshCw,
  Copy,
  CheckCircle,
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
  const [openBookBonusPlayer, setOpenBookBonusPlayer] = useState<{ name: string; emoji: string } | null>(null);

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

  // Save/Load Session States
  const [gameCode, setGameCode] = useState<string>("");
  const [inputCode, setInputCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Real-time Multiplayer & Chat States
  const [isOnlineSync, setIsOnlineSync] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedFunIcon, setSelectedFunIcon] = useState("🚗");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  // Helper to trigger state replication to the server
  const triggerOnlineSync = () => {
    setSyncTrigger((prev) => prev + 1);
  };

  // Replicate state to server whenever local sync trigger is bumped
  useEffect(() => {
    if (syncTrigger > 0 && gameCode && isOnlineSync) {
      pushLocalState();
    }
  }, [syncTrigger]);

  // Generate QR code dynamically when gameCode changes
  useEffect(() => {
    if (gameCode) {
      const shareUrl = `${window.location.origin}/?code=${gameCode}`;
      QRCode.toDataURL(shareUrl, { margin: 1, scale: 5 })
        .then((url) => {
          setQrCodeDataUrl(url);
        })
        .catch((err) => {
          console.error("Chyba při generování QR kódu:", err);
        });
    } else {
      setQrCodeDataUrl("");
    }
  }, [gameCode]);

  // Read URL query parameter for automatic game load/sync on scanned link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    if (codeParam && codeParam.length === 6) {
      const codeUpper = codeParam.toUpperCase();
      setInputCode(codeUpper);
      // Run load
      handleLoadGame(codeUpper);
      setIsOnlineSync(true); // Auto-enable real-time sync
    }
  }, []);

  // Sync state pushing helper
  const pushLocalState = async (
    currentPlayers = players,
    currentGameState = gameState,
    currentActiveIndex = activePlayerIndex,
    currentCategory = selectedCategory,
    currentQuestionText = currentQuestion,
    currentUsed = usedQuestions,
    currentBets = playerBets,
    currentScores = playerScores,
    currentLogs = gameLogs,
    currentCustom = customCards
  ) => {
    if (!gameCode || !isOnlineSync) return;
    try {
      const gameStatePayload = {
        players: currentPlayers,
        activePlayerIndex: currentActiveIndex,
        gameState: currentGameState,
        selectedCategory: currentCategory,
        currentQuestion: currentQuestionText,
        usedQuestions: currentUsed,
        playerBets: currentBets,
        playerScores: currentScores,
        gameLogs: currentLogs,
        customCards: currentCustom,
      };

      await fetch("/api/save-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: gameStatePayload,
          code: gameCode,
        }),
      });
    } catch (err) {
      console.error("Chyba při odesílání herního stavu:", err);
    }
  };

  // Real-time synchronization polling (every 2 seconds)
  useEffect(() => {
    if (!gameCode || !isOnlineSync) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/session-sync/${gameCode}`);
        const data = await response.json();
        if (data.success) {
          // If state exists on backend, merge it gently with local states if they differ
          if (data.gameState) {
            const s = data.gameState;
            if (JSON.stringify(s.players) !== JSON.stringify(players)) {
              setPlayers(s.players);
            }
            if (s.activePlayerIndex !== undefined && s.activePlayerIndex !== activePlayerIndex) {
              setActivePlayerIndex(s.activePlayerIndex);
            }
            if (s.gameState !== undefined && s.gameState !== gameState) {
              setGameState(s.gameState);
            }
            if (JSON.stringify(s.selectedCategory) !== JSON.stringify(selectedCategory)) {
              setSelectedCategory(s.selectedCategory);
            }
            if (s.currentQuestion !== undefined && s.currentQuestion !== currentQuestion) {
              setCurrentQuestion(s.currentQuestion);
            }
            if (JSON.stringify(s.usedQuestions) !== JSON.stringify(usedQuestions)) {
              setUsedQuestions(s.usedQuestions);
            }
            if (JSON.stringify(s.playerBets) !== JSON.stringify(playerBets)) {
              setPlayerBets(s.playerBets);
            }
            if (JSON.stringify(s.playerScores) !== JSON.stringify(playerScores)) {
              setPlayerScores(s.playerScores);
            }
            if (JSON.stringify(s.gameLogs) !== JSON.stringify(gameLogs)) {
              setGameLogs(s.gameLogs);
            }
            if (JSON.stringify(s.customCards) !== JSON.stringify(customCards)) {
              setCustomCards(s.customCards);
            }
          }

          // Merge chat history
          if (data.chat) {
            setChatMessages(data.chat);
          }
        }
      } catch (err) {
        console.error("Error during background session sync:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [
    gameCode,
    isOnlineSync,
    players,
    activePlayerIndex,
    gameState,
    selectedCategory,
    currentQuestion,
    usedQuestions,
    playerBets,
    playerScores,
    gameLogs,
    customCards,
  ]);

  const handleSendChatMessage = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim() || !gameCode) return;

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: gameCode,
          sender: players[activePlayerIndex]?.name || "Neznámý",
          text: textToSend.trim(),
          icon: selectedFunIcon || "💬",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setChatMessages(data.chat);
        if (!presetText) {
          setChatInput("");
        }
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
    }
  };

  const handleCopyShareLink = () => {
    if (!gameCode) return;
    const shareUrl = `${window.location.origin}/?code=${gameCode}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => console.error("Could not copy link", err));
  };

  const handleSaveGame = async () => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const gameStatePayload = {
        players,
        activePlayerIndex,
        gameState,
        selectedCategory,
        currentQuestion,
        usedQuestions,
        playerBets,
        playerScores,
        gameLogs,
        customCards,
      };

      const response = await fetch("/api/save-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: gameStatePayload,
          code: gameCode || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setGameCode(data.code);
        setSaveSuccess(true);
        setIsOnlineSync(true); // Enable real-time sync automatically
        addLog(`Hra byla úspěšně uložena pod kódem: ${data.code}`);
        playSynthesizedSound("fanfare");
      } else {
        throw new Error(data.error || "Chyba při ukládání seance");
      }
    } catch (err: any) {
      console.error(err);
      setSaveError("Nepodařilo se uložit hru. Zkuste to prosím znovu.");
      playSynthesizedSound("lose");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadGame = async (codeToLoad: string) => {
    if (!codeToLoad.trim()) return;
    setIsLoadingGame(true);
    setLoadError("");
    try {
      const response = await fetch(`/api/load-session/${codeToLoad.trim().toUpperCase()}`);
      const data = await response.json();
      if (data.success && data.state) {
        const s = data.state;
        if (s.players) setPlayers(s.players);
        if (s.activePlayerIndex !== undefined) setActivePlayerIndex(s.activePlayerIndex);
        if (s.gameState) setGameState(s.gameState);
        if (s.selectedCategory !== undefined) setSelectedCategory(s.selectedCategory);
        if (s.currentQuestion !== undefined) setCurrentQuestion(s.currentQuestion);
        if (s.usedQuestions) setUsedQuestions(s.usedQuestions);
        if (s.playerBets) setPlayerBets(s.playerBets);
        if (s.playerScores) setPlayerScores(s.playerScores);
        if (s.gameLogs) setGameLogs(s.gameLogs);
        if (s.customCards) setCustomCards(s.customCards);

        if (data.chat) {
          setChatMessages(data.chat);
        }

        setGameCode(codeToLoad.trim().toUpperCase());
        setIsOnlineSync(true); // Enable real-time sync automatically
        addLog(`Hra byla úspěšně načtena z kódu: ${codeToLoad.trim().toUpperCase()}`);
        playSynthesizedSound("fanfare");
        setInputCode("");
      } else {
        throw new Error(data.error || "Kód nebyl nalezen nebo je neplatný.");
      }
    } catch (err: any) {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : "Chyba při načítání seance. Zkontrolujte kód.");
      playSynthesizedSound("lose");
    } finally {
      setIsLoadingGame(false);
    }
  };

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
    const updatedPlayers = [...players, player];
    setPlayers(updatedPlayers);
    
    const newLogItem = {
      id: Math.random().toString(),
      text: `Hráč ${player.emoji} ${player.name} se připojil do hry se 10 žetony.`,
      timestamp: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    const updatedLogs = [newLogItem, ...gameLogs];
    setGameLogs(updatedLogs);

    setNewPlayerName("");
    setNewPlayerAge("");
    playSynthesizedSound("click");

    // Replicate state online
    pushLocalState(updatedPlayers, gameState, activePlayerIndex, selectedCategory, currentQuestion, usedQuestions, playerBets, playerScores, updatedLogs);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) {
      alert("Hra vyžaduje alespoň 2 hráče!");
      return;
    }
    const removed = players.find((p) => p.id === id);
    const updatedPlayers = players.filter((p) => p.id !== id);
    setPlayers(updatedPlayers);

    let updatedLogs = gameLogs;
    if (removed) {
      const newLogItem = {
        id: Math.random().toString(),
        text: `Hráč ${removed.emoji} ${removed.name} opustil hru.`,
        timestamp: new Date().toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      updatedLogs = [newLogItem, ...gameLogs];
      setGameLogs(updatedLogs);
    }
    playSynthesizedSound("click");

    // Replicate state online
    pushLocalState(updatedPlayers, gameState, activePlayerIndex, selectedCategory, currentQuestion, usedQuestions, playerBets, playerScores, updatedLogs);
  };

  // Trigger spinning state
  const handleStartSpin = () => {
    setGameState("spinning");
    playSynthesizedSound("click");
    pushLocalState(players, "spinning");
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
    triggerOnlineSync();
  };

  const handleRevealConfirm = () => {
    setGameState("betting");
    playSynthesizedSound("click");
    triggerOnlineSync();
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
    triggerOnlineSync();
  };

  const togglePlayerScore = (playerId: string) => {
    setPlayerScores((prev) => ({ ...prev, [playerId]: !prev[playerId] }));
    playSynthesizedSound("click");
    triggerOnlineSync();
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
    let isOtevrenaKniha = false;

    if (totalGuessedRight === guessersCount && guessersCount > 0) {
      activePlayerBonus = 2;
      activePlayerEarned = 2;
      bonusText = ` 🎉 ${activePlayer.emoji} ${activePlayer.name} získává bonus +2 žetony za to, že je "otevřenou knihou"!`;
      isOtevrenaKniha = true;
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
    if (isOtevrenaKniha) {
      setOpenBookBonusPlayer({ name: activePlayer.name, emoji: activePlayer.emoji });
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      playSynthesizedSound("win");
    } else {
      if (totalGuessedRight > 0) {
        playSynthesizedSound("fanfare");
      } else {
        playSynthesizedSound("lose");
      }
    }

    // Move to next player's turn
    const nextPlayerIndex = (activePlayerIndex + 1) % players.length;
    setActivePlayerIndex(nextPlayerIndex);
    setGameState("turn_selection");
    triggerOnlineSync();
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
      triggerOnlineSync();
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
    triggerOnlineSync();
  };

  const handleRemoveCustomCard = (categoryKey: string, cardText: string) => {
    setCustomCards((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].filter((t) => t !== cardText),
    }));
    addLog(`Odstraněna vlastní karta: "${cardText}"`);
    playSynthesizedSound("click");
    triggerOnlineSync();
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
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 ${activeTab !== "print" ? "no-print" : ""}`}>
        {/* Mobile View Navigation Tab Helper */}
        <div className="md:hidden flex overflow-x-auto pb-3 mb-4 gap-2 no-scrollbar border-b border-slate-200 no-print">
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
                      <div key={log.id} className="text-[10px] leading-relaxed border-b border-slate-100/60 pb-1.5 last:border-0 flex gap-1.5">
                        <span className="font-mono text-slate-400 font-bold shrink-0">[{log.timestamp}]</span>
                        <span className="text-slate-600 font-medium">{log.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Save, Online Sync & QR Code Sharing Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <Globe className="w-4.5 h-4.5 text-indigo-500 animate-spin" style={{ animationDuration: '8s' }} />
                    <span>Hra Online & Sdílení</span>
                  </h3>
                  {gameCode && isOnlineSync && (
                    <span className="flex items-center gap-1.5 text-[9px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white block"></span>
                      ONLINE SYNC
                    </span>
                  )}
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Propojte rodinu na více zařízeních současně. Změny stavu u jednoho hráče se ihned projeví u ostatních!
                </p>

                {/* Generate / Status Section */}
                <div className="space-y-3">
                  {!gameCode ? (
                    <button
                      onClick={handleSaveGame}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                    >
                      {isSaving ? "⏳ Vytvářím online pokoj..." : "🌐 Vygenerovat kód a hrát online"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* Room Details Block */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            Kód pokoje
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOnlineSync ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {isOnlineSync ? 'Synchro aktivní' : 'Vypnuto'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                          <span className="text-xl font-mono font-black text-slate-800 tracking-wider">
                            {gameCode}
                          </span>
                          <button
                            onClick={handleCopyShareLink}
                            className="flex items-center gap-1 text-[10px] bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-2 py-1 rounded-md transition-all font-semibold"
                          >
                            {linkCopied ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                                <span>Zkopírováno!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Kopírovat odkaz</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Interactive toggle of synchronization */}
                        <div className="flex items-center justify-between pt-1">
                          <label className="text-[10px] font-bold text-slate-600 cursor-pointer select-none flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={isOnlineSync}
                              onChange={(e) => setIsOnlineSync(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                            />
                            Režim reálného času
                          </label>
                          <button
                            onClick={() => {
                              handleSaveGame();
                              addLog("Ruční uložení stavu vyvoláno.");
                            }}
                            className="text-[9px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                            title="Vynutit okamžité uložení stavu"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            Uložit teď
                          </button>
                        </div>
                      </div>

                      {/* Share QR Code Section */}
                      {qrCodeDataUrl && (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-center gap-3">
                          <div className="bg-white p-1 rounded-lg border border-indigo-100 shadow-sm shrink-0">
                            <img
                              src={qrCodeDataUrl}
                              alt="Herní QR Kód"
                              className="w-16 h-16 object-contain"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-900 block uppercase tracking-wide">
                              Naskenuj mobilním foťákem
                            </span>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              Naskenujte QR kód druhým mobilem/tabletem a okamžitě se připojíte do stejné hry!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {saveError && (
                    <p className="text-[10px] text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {saveError}
                    </p>
                  )}
                </div>

                {/* Load Section */}
                <div className="border-t border-slate-100 pt-3.5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Připojit se k jiné hře
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Zadejte kód pokoje"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                      maxLength={6}
                      className="text-center font-mono font-bold tracking-widest text-xs border border-slate-200 p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-slate-50/50 flex-1 uppercase"
                    />
                    <button
                      onClick={() => handleLoadGame(inputCode)}
                      disabled={isLoadingGame || inputCode.length < 6}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3.5 rounded-xl text-xs transition-all disabled:opacity-40 cursor-pointer flex items-center justify-center"
                    >
                      {isLoadingGame ? "..." : "Připojit"}
                    </button>
                  </div>

                  {loadError && (
                    <p className="text-[10px] text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {loadError}
                    </p>
                  )}
                </div>
              </div>

              {/* Rodinný Chat Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 no-print">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                    <span>Rodinný Chat & Reakce</span>
                  </h3>
                  {gameCode && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 font-bold rounded-md">
                      {chatMessages.length} zpráv
                    </span>
                  )}
                </div>

                {!gameCode ? (
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <span className="text-xl block mb-1">🤫</span>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Chat a legrační reakce se zpřístupní, jakmile vygenerujete online kód výše.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Chat Messages Log */}
                    <div className="h-[180px] overflow-y-auto space-y-2.5 border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col-reverse">
                      {chatMessages.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-10 my-auto">
                          Zatím žádné zprávy. Napište něco nebo klikněte na rychlou reakci níže! 👇
                        </p>
                      ) : (
                        [...chatMessages].reverse().map((msg) => (
                          <div key={msg.id} className="text-xs leading-relaxed border-b border-slate-100/40 pb-1.5 last:border-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                                <span>{msg.icon}</span>
                                <span>{msg.sender}</span>
                              </span>
                              <span className="text-[9px] font-mono text-slate-400">
                                {msg.timestamp}
                              </span>
                            </div>
                            <p className="text-slate-600 bg-white/70 px-2 py-1 rounded-md border border-slate-100/50 break-words mt-0.5 text-[11px]">
                              {msg.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick Reactions Grid */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rychlé reakce (Jedno kliknutí):
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {["🚗 Auto jízda!", "🎲 Zatočte!", "🏆 Vyhrávám!", "🌟 Super!", "🎉 Jupíí!", "🤐 Pst!", "🤪 Legrace!", "💡 Vím to!", "🍿 Napínavé!", "🥳 Sláva!"].map((reaction, idx) => {
                          const emoji = reaction.split(" ")[0];
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                handleSendChatMessage(reaction);
                                playSynthesizedSound("click");
                              }}
                              className="text-[10px] bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg p-1.5 transition-all text-center cursor-pointer select-none active:scale-95 text-slate-700"
                              title={reaction}
                            >
                              <span className="text-xs block">{emoji}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chat Text Input */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Ikona:</span>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                          {["🚗", "🎲", "🏆", "🌟", "🎉", "💬", "🤫", "🤪", "💡", "🥳", "🧸", "🍕"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setSelectedFunIcon(emoji);
                                playSynthesizedSound("click");
                              }}
                              className={`w-5.5 h-5.5 text-xs rounded flex items-center justify-center shrink-0 border transition-all ${
                                selectedFunIcon === emoji ? 'bg-indigo-50 border-indigo-400 text-indigo-700 scale-110' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Napište vzkaz..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSendChatMessage();
                              playSynthesizedSound("click");
                            }
                          }}
                          className="text-xs border border-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50/50 flex-1"
                        />
                        <button
                          onClick={() => {
                            handleSendChatMessage();
                            playSynthesizedSound("click");
                          }}
                          disabled={!chatInput.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer shrink-0 flex items-center justify-center w-8 h-8"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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

      {/* "Otevřená kniha" Bonus Celebration Overlay */}
      <AnimatePresence>
        {openBookBonusPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-md no-print"
          >
            {/* Background radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none" />

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ 
                scale: 1, 
                y: 0,
                transition: { type: "spring", damping: 15, stiffness: 100 }
              }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative max-w-md w-full bg-slate-900 border border-amber-500/30 text-white rounded-3xl p-8 text-center shadow-2xl overflow-hidden"
            >
              {/* Animated glowing top border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />

              {/* Decorative sparkles using Framer Motion */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => {
                  const xVal = Math.floor(Math.random() * 100);
                  const yVal = Math.floor(Math.random() * 100);
                  const duration = Math.random() * 2 + 1.5;
                  const delay = Math.random() * 0.5;
                  const scaleMax = Math.random() * 1.5 + 0.5;
                  return (
                    <motion.div
                      key={i}
                      className="absolute text-amber-300"
                      initial={{ 
                        x: "50%", 
                        y: "50%", 
                        opacity: 0, 
                        scale: 0 
                      }}
                      animate={{ 
                        x: `${xVal}%`, 
                        y: `${yVal}%`, 
                        opacity: [0, 0.8, 0],
                        scale: [0, scaleMax, 0],
                      }}
                      transition={{ 
                        duration, 
                        repeat: Infinity,
                        delay
                      }}
                    >
                      ✨
                    </motion.div>
                  );
                })}
              </div>

              {/* Floating animated Book Open and Coin Container */}
              <div className="relative h-32 flex items-center justify-center mb-6">
                {/* Animated Gold Aura */}
                <motion.div
                  className="absolute w-24 h-24 rounded-full bg-amber-500/20 blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Glowing expanding circle */}
                <div className="absolute w-20 h-20 rounded-full border border-amber-400/20 animate-ping opacity-30" />

                {/* Book Open Icon with 3D-like flip/pulse */}
                <motion.div
                  className="z-10 p-5 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 text-slate-950"
                  animate={{
                    y: [0, -10, 0],
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <BookOpen className="w-12 h-12 stroke-[2.5]" />
                </motion.div>

                {/* Floating score gains "+2" */}
                <motion.div
                  className="absolute text-emerald-400 font-display font-extrabold text-3xl tracking-tight filter drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
                  initial={{ opacity: 0, y: 10, scale: 0.5 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    y: [-10, -55, -65],
                    scale: [0.5, 1.4, 1.2, 0.8] 
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                >
                  +2 🪙
                </motion.div>
                
                {/* Left floating coin */}
                <motion.div
                  className="absolute text-2xl"
                  initial={{ opacity: 0, x: -30, y: 20 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: [20, -40, -50],
                    x: [-30, -50, -60],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 2.2, 
                    repeat: Infinity,
                    delay: 0.4,
                    ease: "easeOut"
                  }}
                >
                  🪙
                </motion.div>

                {/* Right floating coin */}
                <motion.div
                  className="absolute text-2xl"
                  initial={{ opacity: 0, x: 30, y: 20 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: [20, -45, -55],
                    x: [30, 50, 60],
                    rotate: [0, -360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: 0.8,
                    ease: "easeOut"
                  }}
                >
                  🪙
                </motion.div>
              </div>

              {/* Category-themed header badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                ✨ Výjimečný Bonus Hry
              </span>

              {/* Title */}
              <h2 className="font-display font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 tracking-tight leading-tight mb-3">
                OTEVŘENÁ KNIHA!
              </h2>

              {/* Description body */}
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto mb-6">
                <span className="text-xl mr-1.5 inline-block animate-bounce">{openBookBonusPlayer.emoji}</span>
                <strong className="text-white font-bold">{openBookBonusPlayer.name}</strong> je pro vaši rodinu naprosto otevřenou knihou! Všichni hádající uhodli jeho tajný tip. Aktivní hráč za toto perfektní sblížení získává <strong>2 bonusové žetony</strong> z banku.
              </p>

              {/* Dismiss Button */}
              <button
                onClick={() => {
                  setOpenBookBonusPlayer(null);
                  playSynthesizedSound("click");
                }}
                className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-display font-black text-xs py-3.5 px-6 rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.98] transition-all uppercase tracking-wider cursor-pointer"
              >
                Pokračovat ve hře ➔
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
