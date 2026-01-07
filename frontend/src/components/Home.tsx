import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert
} from '@mui/material';
import { gameService } from '../services/gameService';

export function Home() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      setError('Digite um nome para a sala');
      return;
    }

    if (!playerName.trim()) {
      setError('Digite seu nome');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await gameService.connect();
      const result = await gameService.createRoom(roomName);

      if (result.success && result.roomId) {
        // Após criar a sala, entra nela automaticamente
        const joinResult = await gameService.joinRoom(result.roomId, playerName);
        
        if (joinResult.success) {
          navigate(`/lobby/${result.roomId}`, { state: { playerName, isCreator: true, fromHome: true } });
        } else {
          setError(joinResult.error || 'Erro ao entrar na sala');
        }
      } else {
        setError(result.error || 'Erro ao criar sala');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Digite o código da sala');
      return;
    }

    if (!playerName.trim()) {
      setError('Digite seu nome');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await gameService.connect();
      const result = await gameService.joinRoom(roomId.toUpperCase(), playerName);

      if (result.success) {
        navigate(`/lobby/${roomId.toUpperCase()}`, { state: { playerName, isCreator: false, fromHome: true } });
      } else {
        setError(result.error || 'Erro ao entrar na sala');
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          🃏 Presidente
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Jogo de cartas online para família
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Criar Nova Sala
          </Typography>
          <TextField
            fullWidth
            label="Nome da Sala"
            variant="outlined"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Seu Nome"
            variant="outlined"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleCreateRoom}
            disabled={loading}
          >
            Criar Sala
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography color="text.secondary">OU</Typography>
        </Divider>

        <Box>
          <Typography variant="h6" gutterBottom>
            Entrar em uma Sala
          </Typography>
          <TextField
            fullWidth
            label="Código da Sala"
            variant="outlined"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            sx={{ mb: 2 }}
            disabled={loading}
            inputProps={{ style: { textTransform: 'uppercase' } }}
          />
          <TextField
            fullWidth
            label="Seu Nome"
            variant="outlined"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            sx={{ mb: 2 }}
            disabled={loading}
          />
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleJoinRoom}
            disabled={loading}
          >
            Entrar na Sala
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

