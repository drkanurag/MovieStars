/**
 * Graph Data Structure for Recommendation & Similarity
 * 
 * Bipartite Adjacency List connecting Titles to Entities (Actors, Directors, Genres).
 * Uses Jaccard overlap on shared neighbors to compute recommendations without heavy ML.
 */

export class MovieGraph {
  // Node ID -> Set of connected Neighbor IDs
  private adjacencyList: Map<string, Set<string>>;

  constructor() {
    this.adjacencyList = new Map();
  }

  private addEdge(u: string, v: string): void {
    if (!this.adjacencyList.has(u)) this.adjacencyList.set(u, new Set());
    if (!this.adjacencyList.has(v)) this.adjacencyList.set(v, new Set());

    this.adjacencyList.get(u)!.add(v);
    this.adjacencyList.get(v)!.add(u);
  }

  public indexTitle(titleId: string, entities: { genres: string[]; cast: string[]; directors: string[] }): void {
    const movieNode = `movie:${titleId}`;

    for (const g of entities.genres) {
      this.addEdge(movieNode, `genre:${g.toLowerCase()}`);
    }
    for (const c of entities.cast) {
      this.addEdge(movieNode, `person:${c.toLowerCase()}`);
    }
    for (const d of entities.directors) {
      this.addEdge(movieNode, `director:${d.toLowerCase()}`);
    }
  }

  /**
   * Computes Jaccard Similarity between two movies:
   * Jaccard = |Neighbors(A) ∩ Neighbors(B)| / |Neighbors(A) ∪ Neighbors(B)|
   */
  public computeSimilarity(titleIdA: string, titleIdB: string): { score: number; commonNeighbors: string[] } {
    const nodeA = `movie:${titleIdA}`;
    const nodeB = `movie:${titleIdB}`;

    const setA = this.adjacencyList.get(nodeA);
    const setB = this.adjacencyList.get(nodeB);

    if (!setA || !setB) return { score: 0, commonNeighbors: [] };

    const common: string[] = [];
    for (const item of setA) {
      if (setB.has(item)) {
        common.push(item);
      }
    }

    const unionSize = new Set([...setA, ...setB]).size;
    const score = unionSize > 0 ? common.length / unionSize : 0;

    return {
      score: Number(score.toFixed(3)),
      commonNeighbors: common.map((n) => n.replace(/^[^:]+:/, '')),
    };
  }

  /**
   * Finds top similar movies to a given title
   */
  public findSimilarMovies(titleId: string, allTitleIds: string[], limit = 4): Array<{ titleId: string; score: number; sharedCount: number }> {
    const targetNode = `movie:${titleId}`;
    const targetNeighbors = this.adjacencyList.get(targetNode);
    if (!targetNeighbors) return [];

    const scores: Array<{ titleId: string; score: number; sharedCount: number }> = [];

    for (const otherId of allTitleIds) {
      if (otherId === titleId) continue;
      const sim = this.computeSimilarity(titleId, otherId);
      if (sim.score > 0) {
        scores.push({ titleId: otherId, score: sim.score, sharedCount: sim.commonNeighbors.length });
      }
    }

    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  public getStats() {
    let totalEdges = 0;
    for (const neighbors of this.adjacencyList.values()) {
      totalEdges += neighbors.size;
    }
    return {
      totalNodes: this.adjacencyList.size,
      totalEdges: Math.floor(totalEdges / 2),
    };
  }
}

