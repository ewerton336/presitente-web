import { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import type { Card } from '../types/game';
import { AnimatedCard } from './AnimatedCard';

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
  const [hasDealt, setHasDealt] = useState(false);
  const [previousCardCount, setPreviousCardCount] = useState(0);

  // Detecta quando cartas são distribuídas pela primeira vez ou quando há uma nova distribuição
  useEffect(() => {
    if (cards.length > 0 && previousCardCount === 0) {
      setHasDealt(false);
      // Pequeno delay para garantir que a animação seja acionada
      setTimeout(() => setHasDealt(true), 50);
    }
    setPreviousCardCount(cards.length);
  }, [cards.length, previousCardCount]);

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Suas Cartas ({cards.length})
      </Typography>
      
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: { xs: 'nowrap', md: 'wrap' },
          justifyContent: 'center',
          mb: 3,
          minHeight: { xs: 100, md: 130 },
          overflowX: { xs: 'auto', md: 'visible' },
          overflowY: 'visible',
          px: { xs: 1, md: 0 },
          '&::-webkit-scrollbar': {
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f1f1f1',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#555',
            },
          },
        }}
      >
        {cards.length === 0 ? (
          <Typography color="text.secondary">Você terminou suas cartas!</Typography>
        ) : (
          <AnimatePresence mode="popLayout">
            {cards.map((card, index) => (
              <AnimatedCard
                key={card.id}
                card={card}
                selected={selectedCards.includes(card.id)}
                onClick={() => onCardClick(card.id)}
                disabled={disabled}
                showDealAnimation={hasDealt && previousCardCount > 5}
                index={index}
              />
            ))}
          </AnimatePresence>
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

