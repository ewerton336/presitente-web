import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { gameService } from "../services/gameService";

export function JoinDirect() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Verifica se já tem uma sessão ativa para esta sala
    const checkExistingSession = () => {
      if (!roomId) {
        setError("Código da sala inválido");
        setCheckingSession(false);
        return;
      }

      const savedPlayerName = localStorage.getItem(
        `player_${roomId.toUpperCase()}`
      );

      if (savedPlayerName) {
        // Já tem sessão, redireciona direto para o lobby
        console.log("Sessão encontrada, redirecionando para lobby...");
        navigate(`/lobby/${roomId.toUpperCase()}`, {
          state: { playerName: savedPlayerName, fromDirect: true },
        });
      } else {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [roomId, navigate]);

  const handleJoin = async () => {
    if (!playerName.trim()) {
      setError("Digite seu nome");
      return;
    }

    if (!roomId) {
      setError("Código da sala inválido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await gameService.connect();
      const result = await gameService.joinRoom(
        roomId.toUpperCase(),
        playerName
      );

      if (result.success) {
        navigate(`/lobby/${roomId.toUpperCase()}`, {
          state: { playerName, isCreator: false, fromHome: true },
        });
      } else {
        setError(result.error || "Erro ao entrar na sala");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Verificando sessão...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          🃏 Presidente
        </Typography>

        <Box
          sx={{
            textAlign: "center",
            bgcolor: "#e3f2fd",
            p: 2,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Entrando na sala
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 1 }}>
            {roomId?.toUpperCase()}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
          Digite seu nome para entrar na partida:
        </Typography>

        <TextField
          fullWidth
          label="Seu Nome"
          variant="outlined"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleJoin()}
          sx={{ mb: 2 }}
          disabled={loading}
          autoFocus
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleJoin}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? "Entrando..." : "Entrar na Sala"}
        </Button>

        <Button
          fullWidth
          variant="text"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Voltar para Home
        </Button>
      </Paper>
    </Container>
  );
}
