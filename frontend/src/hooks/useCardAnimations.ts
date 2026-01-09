import { useState, useCallback, useRef } from 'react';

export interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  animationQueue: string[];
}

export function useCardAnimations() {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentAnimation: null,
    animationQueue: [],
  });

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicia uma nova animação
  const startAnimation = useCallback((animationName: string, duration: number = 1000) => {
    setAnimationState((prev) => {
      // Se já está animando, adiciona à fila
      if (prev.isAnimating) {
        return {
          ...prev,
          animationQueue: [...prev.animationQueue, animationName],
        };
      }

      // Inicia a animação imediatamente
      return {
        isAnimating: true,
        currentAnimation: animationName,
        animationQueue: [],
      };
    });

    // Limpa timeout anterior se existir
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Define timeout para finalizar animação
    animationTimeoutRef.current = setTimeout(() => {
      finishAnimation();
    }, duration);
  }, []);

  // Finaliza a animação atual
  const finishAnimation = useCallback(() => {
    setAnimationState((prev) => {
      // Se há animações na fila, inicia a próxima
      if (prev.animationQueue.length > 0) {
        const [nextAnimation, ...remainingQueue] = prev.animationQueue;
        return {
          isAnimating: true,
          currentAnimation: nextAnimation,
          animationQueue: remainingQueue,
        };
      }

      // Caso contrário, marca como não animando
      return {
        isAnimating: false,
        currentAnimation: null,
        animationQueue: [],
      };
    });
  }, []);

  // Cancela todas as animações
  const cancelAllAnimations = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }

    setAnimationState({
      isAnimating: false,
      currentAnimation: null,
      animationQueue: [],
    });
  }, []);

  // Verifica se uma animação específica está rodando
  const isAnimationRunning = useCallback(
    (animationName: string) => {
      return animationState.currentAnimation === animationName;
    },
    [animationState.currentAnimation]
  );

  // Aguarda até que todas as animações terminem
  const waitForAnimations = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!animationState.isAnimating && animationState.animationQueue.length === 0) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        setAnimationState((current) => {
          if (!current.isAnimating && current.animationQueue.length === 0) {
            clearInterval(checkInterval);
            resolve();
          }
          return current;
        });
      }, 100);
    });
  }, [animationState.isAnimating, animationState.animationQueue.length]);

  return {
    animationState,
    startAnimation,
    finishAnimation,
    cancelAllAnimations,
    isAnimationRunning,
    waitForAnimations,
  };
}
