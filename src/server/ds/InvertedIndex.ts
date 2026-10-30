/**
 * Inverted Index Data Structure
 * 
 * Tokenizes text and maps terms -> posting lists.
 * Provides O(1) term lookup and fast fuzzy full-text search.
 */

export interface Posting {
  titleId: string;
  weight: number; // Term frequency & field boost (e.g. title boost = 3x, cast boost = 2x)
}

export class InvertedIndex {
  // term -> Map<titleId, weight>
  private index: Map<string, Map<string, number>>;
  private documentLengths: Map<string, number>;
  private totalDocs: number;

  constructor() {
    this.index = new Map();
    this.documentLengths = new Map();
    this.totalDocs = 0;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1);
  }

  public addDocument(
    titleId: string,
    fields: { title: string; overview: string; keywords?: string[] }
  ): void {
    const titleTokens = this.tokenize(fields.title);
    const overviewTokens = this.tokenize(fields.overview);
    const keywordTokens = (fields.keywords || []).flatMap((k) => this.tokenize(k));

    let docLength = 0;

    const addTokens = (tokens: string[], boost: number) => {
      for (const token of tokens) {
        docLength++;
        if (!this.index.has(token)) {
          this.index.set(token, new Map());
        }
        const postings = this.index.get(token)!;
        const currentScore = postings.get(titleId) || 0;
        postings.set(titleId, currentScore + boost);
      }
    };

    // Title match carries 4.0x boost, keywords 2.0x, overview 1.0x
    addTokens(titleTokens, 4.0);
    addTokens(keywordTokens, 2.0);
    addTokens(overviewTokens, 1.0);

    this.documentLengths.set(titleId, docLength);
    this.totalDocs++;
  }

  public search(query: string, limit = 10): Array<{ titleId: string; score: number }> {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return [];

    const scores = new Map<string, number>();

    for (const token of tokens) {
      let postings = this.index.get(token);

      // Simple prefix match if exact token not found
      if (!postings) {
        for (const [key, p] of Array.from(this.index.entries())) {
          if (key.startsWith(token)) {
            postings = p;
            break;
          }
        }
      }

      if (postings) {
        // Inverse Document Frequency (IDF)
        const idf = Math.log(1 + (this.totalDocs - postings.size + 0.5) / (postings.size + 0.5));
        for (const [titleId, weight] of postings.entries()) {
          const current = scores.get(titleId) || 0;
          scores.set(titleId, current + weight * (idf + 1));
        }
      }
    }

    return Array.from(scores.entries())
      .map(([titleId, score]) => ({ titleId, score: Number(score.toFixed(2)) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  public getVocabularySize(): number {
    return this.index.size;
  }
}
