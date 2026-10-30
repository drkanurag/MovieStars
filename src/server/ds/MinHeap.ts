/**
 * Min-Heap (Priority Queue) Data Structure
 * 
 * Used for streaming Top-K "Best of All Time" selection in O(N log K) time
 * instead of full sorting O(N log N).
 */

export interface HeapItem<T> {
  score: number;
  data: T;
}

export class MinHeap<T> {
  private heap: HeapItem<T>[];
  private maxSize: number;

  constructor(maxSize: number) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  private parentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private leftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private rightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  private heapifyUp(index: number): void {
    let current = index;
    while (
      current > 0 &&
      this.heap[current].score < this.heap[this.parentIndex(current)].score
    ) {
      const parent = this.parentIndex(current);
      this.swap(current, parent);
      current = parent;
    }
  }

  private heapifyDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (this.leftChildIndex(current) < length) {
      let smallerChild = this.leftChildIndex(current);
      const rightChild = this.rightChildIndex(current);

      if (
        rightChild < length &&
        this.heap[rightChild].score < this.heap[smallerChild].score
      ) {
        smallerChild = rightChild;
      }

      if (this.heap[current].score <= this.heap[smallerChild].score) {
        break;
      }

      this.swap(current, smallerChild);
      current = smallerChild;
    }
  }

  /**
   * Pushes an item. If heap reaches maxSize, evicts the minimum element
   * if the incoming item has a higher score.
   */
  public push(score: number, data: T): void {
    if (this.heap.length < this.maxSize) {
      this.heap.push({ score, data });
      this.heapifyUp(this.heap.length - 1);
    } else if (score > this.heap[0].score) {
      // Replace root (the current minimum in our top-K)
      this.heap[0] = { score, data };
      this.heapifyDown(0);
    }
  }

  public size(): number {
    return this.heap.length;
  }

  public peek(): HeapItem<T> | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Returns items in descending order of score (Rank #1 down to #K)
   */
  public getTopK(): Array<HeapItem<T>> {
    return [...this.heap].sort((a, b) => b.score - a.score);
  }
}

