import { Variants } from 'framer-motion';

// Variantes de animação para distribuição de cartas
export const cardDealVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    y: -200,
    rotateZ: -15,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    rotateZ: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.4,
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  }),
};

// Variantes de animação para jogar cartas
export const cardPlayVariants: Variants = {
  initial: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  play: {
    opacity: 0,
    scale: 0.8,
    y: -100,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

// Variantes de animação para selecionar cartas
export const cardSelectVariants: Variants = {
  unselected: {
    y: 0,
    scale: 1,
  },
  selected: {
    y: -20,
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
};

// Variantes de animação para hover em cartas
export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -10,
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

// Variantes de animação para cartas na mesa
export const tableCardVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    rotateY: 180,
  },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
      type: 'spring',
      stiffness: 150,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.3,
    },
  },
};

// Variantes de animação para nova rodada
export const newRoundBannerVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    y: -100,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
};

// Variantes de animação para partículas/confete
export const confettiVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: (index: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 1, 0.5],
    y: [0, -30, 100],
    x: [0, Math.random() * 100 - 50],
    rotate: [0, Math.random() * 360],
    transition: {
      duration: 2,
      delay: index * 0.05,
      ease: 'easeOut',
    },
  }),
};

// Variantes de animação para troca de cartas
export const cardExchangeVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
  },
};

// Animação de path para troca de cartas (trajetória)
export const cardExchangePathVariants: Variants = {
  initial: {
    pathLength: 0,
    opacity: 0,
  },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 2,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.3,
      },
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Variantes de animação para cartas voando durante troca
export const flyingCardVariants = {
  initial: (origin: { x: number; y: number }) => ({
    x: origin.x,
    y: origin.y,
    opacity: 0,
    scale: 0.5,
  }),
  animate: (destination: { x: number; y: number }) => ({
    x: destination.x,
    y: destination.y,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.3,
    },
  },
};

// Efeito de glow/pulse para última jogada
export const glowPulseVariants: Variants = {
  initial: {
    boxShadow: '0 0 0px rgba(33, 150, 243, 0)',
  },
  animate: {
    boxShadow: [
      '0 0 10px rgba(33, 150, 243, 0.5)',
      '0 0 20px rgba(33, 150, 243, 0.8)',
      '0 0 10px rgba(33, 150, 243, 0.5)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
