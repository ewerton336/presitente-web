import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Alert,
  Snackbar,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { gameService } from "../services/gameService";
import type { Card, Player, CardPlay } from "../types/game";
import { GameTable } from "./GameTable";
import { PlayerHand } from "./PlayerHand";
import { PlayersList } from "./PlayersList";

export function Game() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [myCards, setMyCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [lastPlay, setLastPlay] = useState<CardPlay | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gamePhase, setGamePhase] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [gameFinished, setGameFinished] = useState(false);
  const [rankings, setRankings] = useState<any[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string>("");

  useEffect(() => {
    const gameData = location.state?.gameData;
    if (gameData) {
      console.log("=== Dados iniciais do jogo ===", gameData);
      setMyCards(gameData.yourCards || []);
      setPlayers(gameData.players || []);
      setCurrentPlayer(gameData.currentPlayer);
      setGamePhase("Playing");
      setMyPlayerId(gameData.yourPlayerId || "");

      // Verifica se é o criador da sala
      const myPlayer = gameData.players?.find(
        (p: Player) => p.id === gameData.yourPlayerId
      );
      if (myPlayer) {
        setIsCreator(myPlayer.isRoomCreator);
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Handler para quando um jogador joga
    const handlePlayerPlayed = (data: any) => {
      console.log("=== Jogador jogou ===", data);
      console.log("data.cards:", data.cards);

      setLastPlay({
        playerId: data.playerId,
        playerName: data.playerName,
        cards: data.cards || [],
        playType: data.playType,
      });
      setCurrentPlayer(data.currentPlayer);
      setGamePhase(data.phase);
      setSelectedCards([]);

      // Atualiza a contagem de cartas dos jogadores
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === data.playerId ? { ...p, cardCount: data.playerCardCount } : p
        )
      );

      const cardCount = data.cards ? data.cards.length : 0;
      setMessage(`${data.playerName} jogou ${cardCount} carta(s)`);
    };

    // Handler para quando um jogador passa
    const handlePlayerPassed = (data: any) => {
      console.log("Jogador passou:", data);
      setCurrentPlayer(data.currentPlayer);
      setMessage(`${data.playerName} passou a vez`);
    };

    // Handler para nova rodada
    const handleNewRound = (data: any) => {
      console.log("Nova rodada:", data);
      setLastPlay(null);
      setCurrentPlayer(data.currentPlayer);
      setMessage("Nova rodada iniciada!");
    };

    // Handler para quando um jogador termina
    const handlePlayerFinished = (data: any) => {
      console.log("Jogador terminou:", data);
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === data.playerId ? { ...p, hasFinished: true } : p
        )
      );
      setMessage(`${data.playerName} terminou em ${data.position}º lugar!`);
    };

    // Handler para quando o jogo termina
    const handleGameFinished = (data: any) => {
      console.log("Jogo terminou:", data);
      setGameFinished(true);
      setRankings(data.rankings);
      setGamePhase("GameFinished");
    };

    // Handler para quando o jogo reinicia
    const handleGameStarted = (data: any) => {
      console.log("Novo jogo iniciado:", data);
      setMyCards(data.yourCards || []);
      setPlayers(data.players || []);
      setCurrentPlayer(data.currentPlayer);
      setMyPlayerId(data.yourPlayerId || "");
      setLastPlay(null);
      setSelectedCards([]);
      setGamePhase("Playing");
      setGameFinished(false);
      setMessage("Novo jogo iniciado!");
    };

    gameService.on("PlayerPlayed", handlePlayerPlayed);
    gameService.on("PlayerPassed", handlePlayerPassed);
    gameService.on("NewRound", handleNewRound);
    gameService.on("PlayerFinished", handlePlayerFinished);
    gameService.on("GameFinished", handleGameFinished);
    gameService.on("GameStarted", handleGameStarted);

    return () => {
      gameService.off("PlayerPlayed", handlePlayerPlayed);
      gameService.off("PlayerPassed", handlePlayerPassed);
      gameService.off("NewRound", handleNewRound);
      gameService.off("PlayerFinished", handlePlayerFinished);
      gameService.off("GameFinished", handleGameFinished);
      gameService.off("GameStarted", handleGameStarted);
    };
  }, []);

  // Atualiza se é a vez do jogador
  useEffect(() => {
    console.log("=== Verificando turno ===");
    console.log("currentPlayer:", currentPlayer);
    console.log("myPlayerId:", myPlayerId);
    console.log("players:", players);

    if (currentPlayer && myPlayerId) {
      const isMyTurnValue = currentPlayer.id === myPlayerId;
      console.log("É minha vez?", isMyTurnValue);
      setIsMyTurn(isMyTurnValue);
    }
  }, [currentPlayer, myPlayerId, players]);

  const handleCardClick = (cardId: string) => {
    console.log("=== Card clicked ===");
    console.log("cardId:", cardId);
    console.log("isMyTurn:", isMyTurn);
    console.log("gamePhase:", gamePhase);

    if (!isMyTurn || gamePhase !== "Playing") {
      console.warn(
        "Clique bloqueado! isMyTurn:",
        isMyTurn,
        "gamePhase:",
        gamePhase
      );
      return;
    }

    setSelectedCards((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else {
        // Verifica se todas as cartas selecionadas têm o mesmo valor
        if (prev.length > 0) {
          const firstCard = myCards.find((c) => c.id === prev[0]);
          const newCard = myCards.find((c) => c.id === cardId);
          if (firstCard && newCard && firstCard.value !== newCard.value) {
            setError("Selecione cartas do mesmo valor");
            return prev;
          }
        }
        return [...prev, cardId];
      }
    });
  };

  const handlePlay = async () => {
    if (selectedCards.length === 0) {
      setError("Selecione pelo menos uma carta");
      return;
    }

    try {
      const result = await gameService.playCards(selectedCards);
      if (!result.success) {
        setError(result.error || "Erro ao jogar cartas");
      } else {
        // Remove as cartas jogadas da mão
        setMyCards((prev) => prev.filter((c) => !selectedCards.includes(c.id)));
        setSelectedCards([]);
      }
    } catch (err) {
      setError("Erro ao jogar cartas");
      console.error(err);
    }
  };

  const handlePass = async () => {
    try {
      const result = await gameService.pass();
      if (!result.success) {
        setError(result.error || "Erro ao passar");
      }
    } catch (err) {
      setError("Erro ao passar");
      console.error(err);
    }
  };

  const handleStartNextGame = async () => {
    try {
      const result = await gameService.startNextGame();
      if (!result.success) {
        setError(result.error || "Erro ao iniciar próximo jogo");
      }
    } catch (err) {
      setError("Erro ao iniciar próximo jogo");
      console.error(err);
    }
  };

  const getRankLabel = (rank: string) => {
    const rankLabels: Record<string, string> = {
      Nada: "Nada",
      Presidente: "👑 Presidente",
      VicePresidente: "🥈 Vice-Presidente",
      SubCu: "🥉 Sub-Cu",
      Cu: "💩 Cu",
    };
    return rankLabels[rank] || rank;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box sx={{ flex: { md: "1 1 75%" } }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              Sala: {roomId}
            </Typography>
          </Box>

          <GameTable
            lastPlay={lastPlay}
            currentPlayerName={currentPlayer?.name || null}
          />

          <PlayerHand
            cards={myCards}
            selectedCards={selectedCards}
            onCardClick={handleCardClick}
            onPlay={handlePlay}
            onPass={handlePass}
            canPlay={isMyTurn && gamePhase === "Playing"}
            canPass={isMyTurn && lastPlay !== null && gamePhase === "Playing"}
            disabled={!isMyTurn || gamePhase !== "Playing"}
          />
        </Box>

        <Box sx={{ flex: { md: "1 1 25%" } }}>
          <PlayersList
            players={players}
            currentPlayerId={currentPlayer?.id || null}
          />
        </Box>
      </Box>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={!!message}
        autoHideDuration={3000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setMessage("")}>
          {message}
        </Alert>
      </Snackbar>

      {/* Snackbar para erros */}
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      {/* Dialog de fim de jogo */}
      <Dialog open={gameFinished} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" align="center">
            🎉 Jogo Finalizado!
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Classificação:
          </Typography>
          <List>
            {rankings.map((player, index) => (
              <ListItem key={player.id}>
                <ListItemText
                  primary={`${index + 1}º - ${player.name}`}
                  secondary={getRankLabel(player.rank)}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate("/")}>Voltar ao Início</Button>
          {isCreator && (
            <Button variant="contained" onClick={handleStartNextGame}>
              Jogar Novamente
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
