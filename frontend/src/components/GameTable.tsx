import { Box, Typography, Paper, Chip } from '@mui/material';
import type { CardPlay } from '../types/game';
import { CardComponent } from './CardComponent';

interface GameTableProps {
  lastPlay: CardPlay | null;
  currentPlayerName: string | null;
}

export function GameTable({ lastPlay, currentPlayerName }: GameTableProps) {
  return (
    <Paper elevation={3} sx={{ p: 3, minHeight: 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Mesa
        </Typography>
        {currentPlayerName && (
          <Chip
            label={`Vez de: ${currentPlayerName}`}
            color="primary"
            sx={{ fontSize: '1rem', padding: '20px 10px' }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 150
        }}
      >
        {lastPlay && lastPlay.cards && lastPlay.cards.length > 0 ? (
          <>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Última jogada de {lastPlay.playerName}:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              {lastPlay.cards.map((card) => (
                <CardComponent key={card.id} card={card} disabled />
              ))}
            </Box>
          </>
        ) : (
          <Typography variant="h6" color="text.secondary">
            Aguardando primeira jogada...
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

