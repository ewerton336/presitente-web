import * as signalR from '@microsoft/signalr';

type GameCallback = (data: any) => void;

class GameService {
  private connection: signalR.HubConnection | null = null;
  private callbacks: Map<string, GameCallback[]> = new Map();

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Usa o hostname atual para funcionar tanto local quanto na rede
    const backendUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5188/gameHub'
      : `http://${window.location.hostname}:5188/gameHub`;
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(backendUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Registra todos os event handlers
    this.setupEventHandlers();

    try {
      await this.connection.start();
      console.log('Conectado ao servidor SignalR');
    } catch (error) {
      console.error('Erro ao conectar ao servidor:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // PlayerJoined
    this.connection.on('PlayerJoined', (data) => {
      this.triggerCallbacks('PlayerJoined', data);
    });

    // PlayerLeft
    this.connection.on('PlayerLeft', (data) => {
      this.triggerCallbacks('PlayerLeft', data);
    });

    // RoomState
    this.connection.on('RoomState', (data) => {
      this.triggerCallbacks('RoomState', data);
    });

    // GameStarted
    this.connection.on('GameStarted', (data) => {
      this.triggerCallbacks('GameStarted', data);
    });

    // PlayerPlayed
    this.connection.on('PlayerPlayed', (data) => {
      this.triggerCallbacks('PlayerPlayed', data);
    });

    // PlayerPassed
    this.connection.on('PlayerPassed', (data) => {
      this.triggerCallbacks('PlayerPassed', data);
    });

    // PlayerFinished
    this.connection.on('PlayerFinished', (data) => {
      this.triggerCallbacks('PlayerFinished', data);
    });

    // GameFinished
    this.connection.on('GameFinished', (data) => {
      this.triggerCallbacks('GameFinished', data);
    });

    // NewRound
    this.connection.on('NewRound', (data) => {
      this.triggerCallbacks('NewRound', data);
    });

    // CardExchangeStarted
    this.connection.on('CardExchangeStarted', (data) => {
      this.triggerCallbacks('CardExchangeStarted', data);
    });

    // CardExchangeCompleted
    this.connection.on('CardExchangeCompleted', (data) => {
      this.triggerCallbacks('CardExchangeCompleted', data);
    });
  }

  private triggerCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  on(event: string, callback: GameCallback): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: GameCallback): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.callbacks.clear();
    }
  }

  async createRoom(roomName: string): Promise<{ success: boolean; roomId?: string; error?: string }> {
    if (!this.connection) {
      throw new Error('Não conectado ao servidor');
    }

    try {
      const result = await this.connection.invoke('CreateRoom', roomName);
      return result;
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      return { success: false, error: 'Erro ao criar sala' };
    }
  }

  async joinRoom(roomId: string, playerName: string): Promise<{ success: boolean; error?: string }> {
    if (!this.connection) {
      throw new Error('Não conectado ao servidor');
    }

    try {
      const result = await this.connection.invoke('JoinRoom', roomId, playerName);
      return result;
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      return { success: false, error: 'Erro ao entrar na sala' };
    }
  }

  async startGame(): Promise<{ success: boolean; error?: string }> {
    if (!this.connection) {
      throw new Error('Não conectado ao servidor');
    }

    try {
      const result = await this.connection.invoke('StartGame');
      return result;
    } catch (error) {
      console.error('Erro ao iniciar jogo:', error);
      return { success: false, error: 'Erro ao iniciar jogo' };
    }
  }

  async playCards(cardIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (!this.connection) {
      throw new Error('Não conectado ao servidor');
    }

    try {
      const result = await this.connection.invoke('PlayCards', cardIds);
      return result;
    } catch (error) {
      console.error('Erro ao jogar cartas:', error);
      return { success: false, error: 'Erro ao jogar cartas' };
    }
  }

  async pass(): Promise<{ success: boolean; error?: string }> {
    if (!this.connection) {
      throw new Error('Não conectado ao servidor');
    }

    try {
      const result = await this.connection.invoke('Pass');
      return result;
    } catch (error) {
      console.error('Erro ao passar:', error);
      return { success: false, error: 'Erro ao passar' };
    }
  }

  async startNextGame(): Promise<{ success: boolean; error?: string }> {
    if (!this.connection) {
      throw new Error('Não conectado ao servidor');
    }

    try {
      const result = await this.connection.invoke('StartNextGame');
      return result;
    } catch (error) {
      console.error('Erro ao iniciar próximo jogo:', error);
      return { success: false, error: 'Erro ao iniciar próximo jogo' };
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Singleton instance
export const gameService = new GameService();

