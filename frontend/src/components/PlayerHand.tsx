import { Box, Button, Typography, Paper } from '@mui/material';
import type { Card } from '../types/game';
import { CardComponent } from './CardComponent';

interface PlayerHandProps {
  cards: Card[];
  selectedCards: string[];
  onCardClick: (cardId: string) => void;
  onPlay: () => void;
  onPass: () => void;
  canPlay: boolean;
  canPass: boolean;
  disabled: boolean;
}

export function PlayerHand({
  cards,
  selectedCards,
  onCardClick,
  onPlay,
  onPass,
  canPlay,
  canPass,
  disabled
}: PlayerHandProps) {
  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Suas Cartas ({cards.length})
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: 'center',
          mb: 3,
          minHeight: 130
        }}
      >
        {cards.length === 0 ? (
          <Typography color="text.secondary">Você terminou suas cartas!</Typography>
        ) : (
          cards.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              selected={selectedCards.includes(card.id)}
              onClick={() => onCardClick(card.id)}
              disabled={disabled}
            />
          ))
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={onPlay}
          disabled={!canPlay || disabled || selectedCards.length === 0}
          sx={{ minWidth: 150 }}
        >
          Jogar ({selectedCards.length})
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={onPass}
          disabled={!canPass || disabled}
          sx={{ minWidth: 150 }}
        >
          Passar
        </Button>
      </Box>
    </Paper>
  );
}

