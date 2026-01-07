import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Box,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { gameService } from "../services/gameService";
import type { GameState } from "../types/game";

export function Lobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Inicializa a conexão e entra na sala
  useEffect(() => {
    const initializeLobby = async () => {
      console.log("=== Iniciando Lobby ===");
      console.log("RoomId:", roomId);
      console.log("Location state:", location.state);

      if (!roomId) {
        setError("Código da sala inválido");
        setLoading(false);
        return;
      }

      try {
        // Obtém o playerName do state da navegação ou do localStorage
        const playerName =
          location.state?.playerName ||
          localStorage.getItem(`player_${roomId}`);

        console.log("PlayerName:", playerName);

        if (!playerName) {
          // Se não tiver o nome do jogador, redireciona para home
          console.log("Sem playerName, redirecionando...");
          setError("Sessão expirada. Redirecionando...");
          setTimeout(() => navigate("/"), 2000);
          return;
        }

        // Salva o playerName no localStorage para caso a página seja recarregada
        localStorage.setItem(`player_${roomId}`, playerName);

        // Conecta ao servidor se ainda não estiver conectado
        console.log("SignalR conectado?", gameService.isConnected());
        if (!gameService.isConnected()) {
          console.log("Conectando ao servidor...");
          await gameService.connect();
          console.log("Conectado com sucesso!");
        }

        // Sempre tenta entrar na sala para garantir que receberemos o RoomState
        // Se já estiver na sala, o backend vai reenviar o estado
        console.log("Tentando entrar na sala:", roomId, "como", playerName);
        const result = await gameService.joinRoom(roomId, playerName);
        console.log("Resultado do joinRoom:", result);

        if (!result.success) {
          console.error("Erro ao entrar na sala:", result.error);
          setError(result.error || "Erro ao entrar na sala");
          setLoading(false);
        } else {
          console.log("Entrou na sala com sucesso, aguardando RoomState...");
        }
        // O estado será atualizado quando receber o evento RoomState
      } catch (err) {
        console.error("Erro ao inicializar lobby:", err);
        setError("Erro ao conectar ao servidor");
        setLoading(false);
      }
    };

    initializeLobby();
  }, [roomId, navigate, location.state]);

  // Configura os event handlers do SignalR
  useEffect(() => {
    // Handler para quando um jogador entra
    const handlePlayerJoined = (data: any) => {
      console.log("Jogador entrou:", data);
      if (gameState) {
        setGameState({
          ...gameState,
          players: [...gameState.players, data.player],
        });
      }
    };

    // Handler para quando recebe o estado da sala
    const handleRoomState = (data: any) => {
      console.log("=== RoomState recebido ===", data);
      setGameState(data);
      setLoading(false);
    };

    // Handler para quando o jogo começa
    const handleGameStarted = (data: any) => {
      console.log("Jogo iniciado:", data);
      navigate(`/game/${roomId}`, { state: { gameData: data } });
    };

    // Handler para quando um jogador sai
    const handlePlayerLeft = (data: any) => {
      console.log("Jogador saiu:", data);
      if (gameState) {
        setGameState({
          ...gameState,
          players: gameState.players.filter((p) => p.id !== data.playerId),
        });
      }
    };

    gameService.on("PlayerJoined", handlePlayerJoined);
    gameService.on("RoomState", handleRoomState);
    gameService.on("GameStarted", handleGameStarted);
    gameService.on("PlayerLeft", handlePlayerLeft);

    return () => {
      gameService.off("PlayerJoined", handlePlayerJoined);
      gameService.off("RoomState", handleRoomState);
      gameService.off("GameStarted", handleGameStarted);
      gameService.off("PlayerLeft", handlePlayerLeft);
    };
  }, [roomId, navigate, gameState]);

  const handleStartGame = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await gameService.startGame();
      if (!result.success) {
        setError(result.error || "Erro ao iniciar jogo");
      }
    } catch (err) {
      setError("Erro ao iniciar jogo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankLabel = (rank: string) => {
    const rankLabels: Record<string, string> = {
      Nada: "Nada",
      Presidente: "Presidente",
      VicePresidente: "Vice-Presidente",
      SubCu: "Sub-Cu",
      Cu: "Cu",
    };
    return rankLabels[rank] || rank;
  };

  const getRankColor = (rank: string) => {
    const colors: Record<
      string,
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning"
    > = {
      Presidente: "success",
      VicePresidente: "info",
      Nada: "default",
      SubCu: "warning",
      Cu: "error",
    };
    return colors[rank] || "default";
  };

  if (!gameState) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5">Carregando...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold" }}
        >
          Sala: {gameState.roomName}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Chip
            label={`Código: ${roomId}`}
            color="primary"
            sx={{ fontSize: "1.2rem", padding: "20px 10px" }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Jogadores ({gameState.players.length}/8):
        </Typography>

        <List>
          {gameState.players.map((player, index) => (
            <Box key={player.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {player.name}
                      </Typography>
                      {player.isRoomCreator && (
                        <Chip label="Criador" size="small" color="primary" />
                      )}
                      {player.rank && player.rank !== "Nada" && (
                        <Chip
                          label={getRankLabel(player.rank)}
                          size="small"
                          color={getRankColor(player.rank)}
                        />
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < gameState.players.length - 1 && <Divider />}
            </Box>
          ))}
        </List>

        <Box sx={{ mt: 4 }}>
          {gameState.isCreator ? (
            <>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleStartGame}
                disabled={loading || !gameState.canStart}
                sx={{ mb: 1 }}
              >
                Iniciar Jogo
              </Button>
              {!gameState.canStart && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  display="block"
                >
                  Mínimo 2 jogadores para iniciar
                </Typography>
              )}
            </>
          ) : (
            <Alert severity="info">
              Aguardando o criador da sala iniciar o jogo...
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
