import { Paper, Typography, List, ListItem, ListItemText, Chip, Box, Divider } from '@mui/material';
import type { Player } from '../types/game';

interface PlayersListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export function PlayersList({ players, currentPlayerId }: PlayersListProps) {
  const getRankLabel = (rank: string) => {
    const rankLabels: Record<string, string> = {
      'Nada': 'Nada',
      'Presidente': 'Presidente',
      'VicePresidente': 'Vice',
      'SubCu': 'Sub-Cu',
      'Cu': 'Cu'
    };
    return rankLabels[rank] || rank;
  };

  const getRankColor = (rank: string) => {
    const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      'Presidente': 'success',
      'VicePresidente': 'info',
      'Nada': 'default',
      'SubCu': 'warning',
      'Cu': 'error'
    };
    return colors[rank] || 'default';
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Jogadores
      </Typography>
      <List dense>
        {players.map((player, index) => (
          <Box key={player.id}>
            <ListItem
              sx={{
                backgroundColor: currentPlayerId === player.id ? '#e3f2fd' : 'transparent',
                borderRadius: 1
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: currentPlayerId === player.id ? 'bold' : 'normal'
                      }}
                    >
                      {player.name}
                    </Typography>
                    {player.rank && player.rank !== 'Nada' && (
                      <Chip
                        label={getRankLabel(player.rank)}
                        size="small"
                        color={getRankColor(player.rank)}
                      />
                    )}
                    {player.hasFinished && (
                      <Chip label="Terminou" size="small" color="default" />
                    )}
                  </Box>
                }
                secondary={
                  !player.hasFinished && player.cardCount !== undefined
                    ? `${player.cardCount} carta${player.cardCount !== 1 ? 's' : ''}`
                    : null
                }
              />
            </ListItem>
            {index < players.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}

