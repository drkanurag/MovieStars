/**
 * LRU Cache (Least Recently Used) Data Structure
 * 
 * Implemented using a Doubly Linked List + Hash Map
 * for strict O(1) get and O(1) put operations.
 */

class DNode<K, V> {
  key: K;
  value: V;
  prev: DNode<K, V> | null;
  next: DNode<K, V> | null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

export class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, DNode<K, V>>;
  private head: DNode<K, V>; // dummy head (most recently used near head)
  private tail: DNode<K, V>; // dummy tail (least recently used near tail)
  private hits: number;
  private misses: number;
  private evictions: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new DNode<K, V>(null as any, null as any);
    this.tail = new DNode<K, V>(null as any, null as any);
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
  }

  private removeNode(node: DNode<K, V>): void {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  private addNodeToHead(node: DNode<K, V>): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  public get(key: K): V | null {
    if (!this.map.has(key)) {
      this.misses++;
      return null;
    }

    const node = this.map.get(key)!;
    // Move to head (marked as recently accessed)
    this.removeNode(node);
    this.addNodeToHead(node);
    this.hits++;
    return node.value;
  }

  public put(key: K, value: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.removeNode(node);
      this.addNodeToHead(node);
    } else {
      if (this.map.size >= this.capacity) {
        // Evict LRU item from tail
        const lru = this.tail.prev!;
        this.removeNode(lru);
        this.map.delete(lru.key);
        this.evictions++;
      }
      const newNode = new DNode<K, V>(key, value);
      this.map.set(key, newNode);
      this.addNodeToHead(newNode);
    }
  }

  public getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;
    return {
      capacity: this.capacity,
      size: this.map.size,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      hitRatePercent: Number(hitRate.toFixed(1)),
    };
  }
}

