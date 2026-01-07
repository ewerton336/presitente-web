export const Suit = {
  Hearts: 'Hearts',
  Diamonds: 'Diamonds',
  Clubs: 'Clubs',
  Spades: 'Spades'
} as const;

export const CardValue = {
  Ace: 'Ace',
  Two: 'Two',
  Three: 'Three',
  Four: 'Four',
  Five: 'Five',
  Six: 'Six',
  Seven: 'Seven',
  Eight: 'Eight',
  Nine: 'Nine',
  Ten: 'Ten',
  Jack: 'Jack',
  Queen: 'Queen',
  King: 'King'
} as const;

export const PlayerRank = {
  Nada: 'Nada',
  Presidente: 'Presidente',
  VicePresidente: 'VicePresidente',
  SubCu: 'SubCu',
  Cu: 'Cu'
} as const;

export const GamePhase = {
  WaitingForPlayers: 'WaitingForPlayers',
  CardExchange: 'CardExchange',
  Playing: 'Playing',
  RoundFinished: 'RoundFinished',
  GameFinished: 'GameFinished'
} as const;

export const PlayType = {
  Single: 'Single',
  Double: 'Double',
  Triple: 'Triple',
  Quadruple: 'Quadruple'
} as const;

export interface Card {
  id: string;
  value: string;
  suit: string;
}

export interface Player {
  id: string;
  name: string;
  rank: string;
  isRoomCreator: boolean;
  hasFinished?: boolean;
  cardCount?: number;
}

export interface CardPlay {
  playerId: string;
  playerName: string;
  cards: Card[];
  playType: string;
}

export interface GameState {
  roomId: string;
  roomName: string;
  players: Player[];
  phase: string;
  currentPlayer?: {
    id: string;
    name: string;
  };
  lastPlay?: CardPlay;
  canStart: boolean;
  isCreator: boolean;
  gameNumber?: number;
  isFirstGame?: boolean;
}

