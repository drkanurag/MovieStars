/**
 * Trie (Prefix Tree) Data Structure
 * 
 * Used in Search Service for O(L) prefix-based instant autocomplete,
 * where L is the length of the search prefix.
 */

export interface TrieResult {
  titleId: string;
  title: string;
  type: string;
  score: number;
}

class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  entries: TrieResult[];

  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.entries = [];
  }
}

export class AutocompleteTrie {
  private root: TrieNode;
  private totalNodes: number;

  constructor() {
    this.root = new TrieNode();
    this.totalNodes = 1;
  }

  public insert(phrase: string, item: TrieResult): void {
    const normalized = phrase.toLowerCase().trim();
    let current = this.root;

    for (const char of normalized) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
        this.totalNodes++;
      }
      current = current.children.get(char)!;
      // Keep top entries sorted by score at each node for instant O(L) retrieval
      if (!current.entries.some((e) => e.titleId === item.titleId)) {
        current.entries.push(item);
        current.entries.sort((a, b) => b.score - a.score);
        if (current.entries.length > 10) {
          current.entries.pop();
        }
      }
    }

    current.isEndOfWord = true;
  }

  public searchPrefix(prefix: string, limit = 6): TrieResult[] {
    const normalized = prefix.toLowerCase().trim();
    if (!normalized) return [];

    let current = this.root;
    for (const char of normalized) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }

    return current.entries.slice(0, limit);
  }

  public getNodeCount(): number {
    return this.totalNodes;
  }
}

