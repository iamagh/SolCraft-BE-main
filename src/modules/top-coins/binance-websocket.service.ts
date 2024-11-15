import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';

@Injectable()
export class BinanceWebSocketService implements OnModuleInit, OnModuleDestroy {
  private binanceWs: WebSocket;
  private messageCallbacks: ((data: any) => void)[] = [];

  onModuleInit() {
    this.connectToBinance();
  }

  onModuleDestroy() {
    this.disconnectFromBinance();
  }

  private connectToBinance() {
    this.binanceWs = new WebSocket(
      'wss://stream.binance.com:9443/ws/!ticker@arr',
    );

    this.binanceWs.on('message', (message) => {
      const data = JSON.parse(message.toString());
      const topCoins = this.processData(data);

      this.messageCallbacks.forEach((callback) => callback(topCoins));
    });

    this.binanceWs.on('error', (error) => {
      console.error('Binance WebSocket error:', error);
      this.reconnectToBinance();
    });

    this.binanceWs.on('close', () => {
      console.log('Binance WebSocket closed. Reconnecting...');
      this.reconnectToBinance();
    });
  }

  private reconnectToBinance() {
    setTimeout(() => this.connectToBinance(), 5000);
  }

  private disconnectFromBinance() {
    if (this.binanceWs) {
      this.binanceWs.close();
    }
  }

  private processData(data: any[]): any[] {
    return data
      .sort((a, b) => parseFloat(b.c) - parseFloat(a.c))
      .slice(0, 3)
      .map((coin) => ({
        symbol: coin.s,
        price: coin.c,
        volume: coin.v,
      }));
  }

  public onMessage(callback: (data: any) => void) {
    this.messageCallbacks.push(callback);
  }
}
