import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { newRoundBannerVariants, confettiVariants } from '../styles/animations';

interface NewRoundAnimationProps {
  show: boolean;
  winnerName?: string | null;
  onComplete?: () => void;
}

// Componente de partícula de confete
function ConfettiParticle({ index, color }: { index: number; color: string }) {
  return (
    <motion.div
      custom={index}
      variants={confettiVariants}
      initial="hidden"
      animate="visible"
      style={{
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: color,
        borderRadius: index % 2 === 0 ? '50%' : '0%',
      }}
    />
  );
}

export const NewRoundAnimation = memo(function NewRoundAnimation({ show, winnerName, onComplete }: NewRoundAnimationProps) {
  const confettiColors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];

  return (
    <AnimatePresence
      onExitComplete={onComplete}
    >
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {/* Banner de Nova Rodada */}
          <motion.div
            variants={newRoundBannerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'relative',
              zIndex: 10000,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                padding: { xs: '30px 40px', md: '40px 80px' },
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
              }}
            >
              {winnerName && (
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'medium',
                    fontSize: { xs: '1.2rem', md: '1.8rem' },
                    mb: 2,
                    opacity: 0.95,
                  }}
                >
                  🏆 {winnerName} venceu a rodada!
                </Typography>
              )}
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2rem', md: '3.5rem' },
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                🎉 Nova Rodada! 🎉
              </Typography>
            </Box>
          </motion.div>

          {/* Confete */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {Array.from({ length: 30 }).map((_, index) => (
              <ConfettiParticle
                key={index}
                index={index}
                color={confettiColors[index % confettiColors.length]}
              />
            ))}
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
