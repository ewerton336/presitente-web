import { Card as MuiCard, CardContent, Typography } from '@mui/material';
import type { Card } from '../types/game';

interface CardComponentProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const suitSymbols: Record<string, string> = {
  Hearts: '♥',
  Diamonds: '♦',
  Clubs: '♣',
  Spades: '♠'
};

const suitColors: Record<string, string> = {
  Hearts: '#e74c3c',
  Diamonds: '#e74c3c',
  Clubs: '#2c3e50',
  Spades: '#2c3e50'
};

const valueNames: Record<string, string> = {
  Ace: 'A',
  Two: '2',
  Three: '3',
  Four: '4',
  Five: '5',
  Six: '6',
  Seven: '7',
  Eight: '8',
  Nine: '9',
  Ten: '10',
  Jack: 'J',
  Queen: 'Q',
  King: 'K'
};

export function CardComponent({ card, selected = false, onClick, disabled = false }: CardComponentProps) {
  const symbol = suitSymbols[card.suit] || card.suit;
  const color = suitColors[card.suit] || '#000';
  const displayValue = valueNames[card.value] || card.value;

  return (
    <MuiCard
      onClick={!disabled ? onClick : undefined}
      sx={{
        width: 80,
        height: 110,
        cursor: disabled ? 'default' : 'pointer',
        border: selected ? '3px solid #2196f3' : '1px solid #ccc',
        transform: selected ? 'translateY(-10px)' : 'none',
        transition: 'all 0.2s ease',
        backgroundColor: disabled ? '#f5f5f5' : 'white',
        '&:hover': disabled ? {} : {
          transform: selected ? 'translateY(-10px)' : 'translateY(-5px)',
          boxShadow: 3
        },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <CardContent sx={{ padding: '8px !important', textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: color,
            fontWeight: 'bold',
            lineHeight: 1
          }}
        >
          {displayValue}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: color,
            lineHeight: 1,
            marginTop: 0.5
          }}
        >
          {symbol}
        </Typography>
      </CardContent>
    </MuiCard>
  );
}

