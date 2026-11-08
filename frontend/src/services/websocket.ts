type EventCallback = (event: string, data: any) => void;

export class NexusWebSocketClient {
  private url: string;
  private socket: WebSocket | null = null;
  private pingInterval: any = null;
  private reconnectTimeout: any = null;
  private callbacks: Set<EventCallback> = new Set();
  private isClosedManually = false;

  constructor(projectId: string) {
    const wsBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');
    this.url = `${wsBase}/ws/${projectId}`;
    this.connect();
  }

  private connect() {
    this.isClosedManually = false;
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        // Start heartbeat ping
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send('ping');
          }
        }, 15000);
      };

      this.socket.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const payload = JSON.parse(event.data);
          this.callbacks.forEach((cb) => cb(payload.event, payload.data));
        } catch (e) {
          console.warn('Non-JSON WebSocket message received:', event.data);
        }
      };

      this.socket.onclose = () => {
        clearInterval(this.pingInterval);
        if (!this.isClosedManually) {
          this.reconnectTimeout = setTimeout(() => this.connect(), 3000);
        }
      };

      this.socket.onerror = (error) => {
        console.warn('WebSocket error observed:', error);
      };
    } catch (e) {
      console.warn('Could not establish WebSocket connection:', e);
    }
  }

  public subscribe(cb: EventCallback) {
    this.callbacks.add(cb);
    return () => this.callbacks.delete(cb);
  }

  public close() {
    this.isClosedManually = true;
    clearInterval(this.pingInterval);
    clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

