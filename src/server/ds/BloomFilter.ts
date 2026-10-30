/**
 * Bloom Filter Data Structure
 * 
 * Probabilistic data structure used in Ingestion Service
 * to avoid reprocessing titles already ingested without querying the DB every time.
 */

export class BloomFilter {
  private size: number;
  private hashCount: number;
  private bitArray: Uint8Array;
  private itemsCount: number;

  constructor(size = 10000, hashCount = 4) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Uint8Array(Math.ceil(size / 8));
    this.itemsCount = 0;
  }

  private hash(str: string, seed: number): number {
    let h = 0x811c9dc5 ^ seed;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return Math.abs(h % this.size);
  }

  private setBit(index: number): void {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    this.bitArray[byteIndex] |= 1 << bitIndex;
  }

  private getBit(index: number): boolean {
    const byteIndex = Math.floor(index / 8);
    const bitIndex = index % 8;
    return (this.bitArray[byteIndex] & (1 << bitIndex)) !== 0;
  }

  public add(key: string): void {
    for (let i = 0; i < this.hashCount; i++) {
      const bit = this.hash(key, i * 31);
      this.setBit(bit);
    }
    this.itemsCount++;
  }

  public mightContain(key: string): boolean {
    for (let i = 0; i < this.hashCount; i++) {
      const bit = this.hash(key, i * 31);
      if (!this.getBit(bit)) {
        return false; // Definitely not present
      }
    }
    return true; // Probably present
  }

  public getStats() {
    // Estimated false positive probability: (1 - e^(-k*n/m))^k
    const exponent = (-this.hashCount * this.itemsCount) / this.size;
    const fpp = Math.pow(1 - Math.exp(exponent), this.hashCount);

    return {
      bitSize: this.size,
      hashFunctions: this.hashCount,
      elementsAdded: this.itemsCount,
      estimatedFalsePositiveRate: Number((fpp * 100).toFixed(4)),
    };
  }
}

