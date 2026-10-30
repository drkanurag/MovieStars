/**
 * Event-Driven Message Broker (In-Memory Pub/Sub)
 * 
 * Facilitates asynchronous microservice communication without direct coupling:
 * - 'title:ingested' -> Search Service updates Inverted Index & Trie
 * - 'rating:submitted' -> Rating Service updates MinHeap and Bayesian ranks
 * - 'availability:updated' -> Availability Service invalidates region caches
 * - 'release:approaching' -> Notification Service triggers user alerts
 */

export type EventTopic =
  | 'title:ingested'
  | 'title:updated'
  | 'rating:submitted'
  | 'availability:updated'
  | 'notification:trigger';

export interface EventMessage<T = any> {
  id: string;
  topic: EventTopic;
  payload: T;
  timestamp: string;
  sourceService: string;
}

export type EventHandler<T = any> = (event: EventMessage<T>) => Promise<void> | void;

export class EventBus {
  private static instance: EventBus;
  private subscribers: Map<EventTopic, EventHandler[]>;
  private messageHistory: EventMessage[];

  private constructor() {
    this.subscribers = new Map();
    this.messageHistory = [];
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public subscribe<T = any>(topic: EventTopic, handler: EventHandler<T>): void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic)!.push(handler);
  }

  public async publish<T = any>(topic: EventTopic, payload: T, sourceService: string): Promise<void> {
    const event: EventMessage<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      topic,
      payload,
      timestamp: new Date().toISOString(),
      sourceService,
    };

    this.messageHistory.unshift(event);
    if (this.messageHistory.length > 50) {
      this.messageHistory.pop();
    }

    const handlers = this.subscribers.get(topic) || [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (err) {
        console.error(`Error in event handler for topic ${topic} from ${sourceService}:`, err);
      }
    }
  }

  public getRecentEvents(limit = 20): EventMessage[] {
    return this.messageHistory.slice(0, limit);
  }
}

