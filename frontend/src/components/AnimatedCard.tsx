import { memo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';
import type { Card } from '../types/game';
import {
  cardSelectVariants,
  cardDealVariants,
} from '../styles/animations';

interface AnimatedCardProps {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  animationDelay?: number;
  animationOrigin?: { x: number; y: number };
  onAnimationComplete?: () => void;
  showDealAnimation?: boolean;
  index?: number;
}

const suitSymbols: Record<string, string> = {
  Hearts: '♥',
  Diamonds: '♦',
  Clubs: '♣',
  Spades: '♠',
};

const suitColors: Record<string, string> = {
  Hearts: '#e74c3c',
  Diamonds: '#e74c3c',
  Clubs: '#2c3e50',
  Spades: '#2c3e50',
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
  King: 'K',
};

export const AnimatedCard = memo(function AnimatedCard({
  card,
  selected = false,
  onClick,
  disabled = false,
  animationDelay = 0,
  animationOrigin,
  onAnimationComplete,
  showDealAnimation = false,
  index = 0,
}: AnimatedCardProps) {
  const symbol = suitSymbols[card.suit] || card.suit;
  const color = suitColors[card.suit] || '#000';
  const displayValue = valueNames[card.value] || card.value;

  // Valor de movimento para rotação sutil no hover
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  // Define a variante inicial baseada na origem da animação
  const initialVariant = showDealAnimation
    ? 'hidden'
    : selected
    ? 'selected'
    : 'unselected';

  // Define a variante de animação
  const animateVariant = showDealAnimation
    ? 'visible'
    : selected
    ? 'selected'
    : 'unselected';

  return (
    <motion.div
      custom={index}
      initial={initialVariant}
      animate={animateVariant}
      variants={showDealAnimation ? cardDealVariants : cardSelectVariants}
      whileHover={disabled ? undefined : 'hover'}
      onAnimationComplete={onAnimationComplete}
      style={{
        rotateX: disabled ? 0 : rotateX,
        rotateY: disabled ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      onMouseMove={(e) => {
        if (!disabled) {
          const rect = e.currentTarget.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          x.set(e.clientX - centerX);
          y.set(e.clientY - centerY);
        }
      }}
      onMouseLeave={() => {
        if (!disabled) {
          x.set(0);
          y.set(0);
        }
      }}
    >
      <MuiCard
        onClick={!disabled ? onClick : undefined}
        sx={{
          width: { xs: 60, md: 80 },
          height: { xs: 85, md: 110 },
          minWidth: { xs: 60, md: 80 },
          cursor: disabled ? 'default' : 'pointer',
          border: selected ? '3px solid #2196f3' : '1px solid #ccc',
          backgroundColor: disabled ? '#f5f5f5' : 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'border 0.2s ease',
          boxShadow: selected
            ? '0 4px 20px rgba(33, 150, 243, 0.4)'
            : '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': disabled
            ? {}
            : {
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              },
        }}
      >
        <CardContent sx={{ padding: { xs: '4px !important', md: '8px !important' }, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              color: color,
              fontWeight: 'bold',
              lineHeight: 1,
              fontSize: { xs: '1.5rem', md: '2.125rem' },
            }}
          >
            {displayValue}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: color,
              lineHeight: 1,
              marginTop: 0.5,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
            }}
          >
            {symbol}
          </Typography>
        </CardContent>
      </MuiCard>
    </motion.div>
  );
});
