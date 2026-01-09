import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Paper } from '@mui/material';
import { cardExchangeVariants } from '../styles/animations';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

interface Exchange {
  fromPlayer: { id: string; name: string };
  toPlayer: { id: string; name: string };
  cardCount: number;
}

interface CardExchangeAnimationProps {
  show: boolean;
  exchanges: Exchange[];
  onComplete?: () => void;
}

// Componente de carta voando
function FlyingCard({ 
  index, 
  delay 
}: { 
  index: number; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.5],
        x: [0, Math.sin(index * 2) * 20, 0],
        y: [0, -30, 0],
      }}
      transition={{
        duration: 2,
        delay: delay,
        ease: 'easeInOut',
      }}
      style={{
        position: 'absolute',
        width: 40,
        height: 55,
        backgroundColor: '#fff',
        border: '2px solid #2196f3',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    />
  );
}

export const CardExchangeAnimation = memo(function CardExchangeAnimation({ 
  show, 
  exchanges, 
  onComplete 
}: CardExchangeAnimationProps) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            variants={cardExchangeVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'relative',
              zIndex: 10000,
            }}
          >
            <Paper
              elevation={10}
              sx={{
                backgroundColor: 'background.paper',
                padding: '40px 60px',
                borderRadius: '16px',
                textAlign: 'center',
                minWidth: { xs: '280px', md: '400px' },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  color: 'primary.main',
                }}
              >
                Troca de Cartas
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {exchanges.map((exchange, index) => (
                  <motion.div
                    key={`${exchange.fromPlayer.id}-${exchange.toPlayer.id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 2,
                        backgroundColor: 'action.hover',
                        borderRadius: 2,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 'medium',
                          flex: 1,
                          textAlign: 'left',
                        }}
                      >
                        {exchange.fromPlayer.name}
                      </Typography>

                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <motion.div
                          animate={{
                            x: [0, 10, 0],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <SwapHorizIcon color="primary" sx={{ fontSize: 32 }} />
                        </motion.div>
                        
                        {/* Cartas voando */}
                        {Array.from({ length: exchange.cardCount }).map((_, cardIndex) => (
                          <FlyingCard
                            key={cardIndex}
                            index={cardIndex}
                            delay={index * 0.3 + cardIndex * 0.1}
                          />
                        ))}
                      </Box>

                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 'medium',
                          flex: 1,
                          textAlign: 'right',
                        }}
                      >
                        {exchange.toPlayer.name}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>

              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                }}
              >
                Aguarde...
              </Typography>
            </Paper>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
