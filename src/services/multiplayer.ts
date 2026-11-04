// Real-time WebSocket Client for Brain Battle

import { PlayerProfile, QuestionData, GameCategory } from '../types/game';

type MessageCallback = (data: any) => void;

class MultiplayerService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<MessageCallback>> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimer: any = null;
  private registeredPlayer: PlayerProfile | null = null;

  constructor() {
    this.connect();
  }

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        if (this.registeredPlayer) {
          this.registerPlayer(this.registeredPlayer);
        }
        this.emit('connection_status', { connected: true });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type) {
            this.emit(data.type, data);
          }
          this.emit('*', data);
        } catch (e) {
          console.error('Failed to parse incoming WS message', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.emit('connection_status', { connected: false });
        // Attempt reconnect after 3 seconds
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 3000);
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
      };
    } catch (e) {
      this.isConnecting = false;
      console.warn('WS Init failed:', e);
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public registerPlayer(player: PlayerProfile) {
    this.registeredPlayer = player;
    this.send({
      type: 'register_player',
      player: {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        country: player.country,
        rating: player.rating,
        level: player.level,
      },
    });
  }

  public joinMatchmaking(player: PlayerProfile, category: GameCategory = 'all-round') {
    this.send({
      type: 'join_matchmaking',
      player: {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        country: player.country,
        rating: player.rating,
        level: player.level,
      },
      category,
    });
  }

  public cancelMatchmaking() {
    this.send({ type: 'cancel_matchmaking' });
  }

  public createRoom(player: PlayerProfile, category: GameCategory = 'all-round') {
    this.send({
      type: 'create_room',
      player: {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        country: player.country,
        rating: player.rating,
        level: player.level,
      },
      category,
    });
  }

  public joinRoom(player: PlayerProfile, roomCode: string) {
    this.send({
      type: 'join_room',
      roomCode,
      player: {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        country: player.country,
        rating: player.rating,
        level: player.level,
      },
    });
  }

  public submitAnswer(roomCode: string, playerId: string, questionIndex: number, answer: string, timeTakenMs: number) {
    this.send({
      type: 'submit_answer',
      roomCode,
      playerId,
      questionIndex,
      answer,
      timeTakenMs,
    });
  }

  public sendEmoji(roomCode: string, playerId: string, emoji: string) {
    this.send({
      type: 'send_emoji',
      roomCode,
      playerId,
      emoji,
    });
  }

  public requestRematch(roomCode: string, playerId: string) {
    this.send({
      type: 'request_rematch',
      roomCode,
      playerId,
    });
  }

  private send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // If disconnected, try reconnect and retry
      this.connect();
    }
  }

  public on(event: string, callback: MessageCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: MessageCallback) {
    const list = this.listeners.get(event);
    if (list) {
      list.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
}

export const multiplayer = new MultiplayerService();
