import { Box, Typography, Paper, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardPlay } from '../types/game';
import { AnimatedCard } from './AnimatedCard';
import { tableCardVariants, glowPulseVariants } from '../styles/animations';

interface GameTableProps {
  lastPlay: CardPlay | null;
  currentPlayerName: string | null;
}

export function GameTable({ lastPlay, currentPlayerName }: GameTableProps) {
  return (
    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, minHeight: { xs: 200, md: 250 } }}>
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
        <AnimatePresence mode="wait">
          {lastPlay && lastPlay.cards && lastPlay.cards.length > 0 ? (
            <motion.div
              key={lastPlay.playerId + '-' + lastPlay.cards.map(c => c.id).join('-')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Última jogada de {lastPlay.playerName}:
              </Typography>
              <motion.div
                style={{ display: 'flex', gap: 8, marginTop: 16 }}
                variants={glowPulseVariants}
                initial="initial"
                animate="animate"
              >
                <AnimatePresence mode="popLayout">
                  {lastPlay.cards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={tableCardVariants}
                    >
                      <AnimatedCard card={card} disabled />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Typography variant="h6" color="text.secondary">
                Aguardando primeira jogada...
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Paper>
  );
}

