/**
 * Bayesian Weighted Rating Engine
 * 
 * Formula:
 * Weighted Score = (v / (v + m)) * R + (m / (v + m)) * C
 * 
 * Where:
 * - v: Number of votes for the title
 * - m: Minimum votes required to be considered for Top Lists (default: 25,000 for all-time, 1,000 for recent)
 * - R: Raw average rating of the title (scale: 0.0 - 10.0)
 * - C: Global mean rating across all titles in the dataset (default: 6.9)
 */

export interface BayesianParams {
  minVotes?: number;
  globalMean?: number;
}

export const DEFAULT_MIN_VOTES = 25000;
export const DEFAULT_GLOBAL_MEAN = 6.9;

export function calculateBayesianScore(
  votes: number,
  rawScore: number,
  params?: BayesianParams
): number {
  const m = params?.minVotes ?? DEFAULT_MIN_VOTES;
  const C = params?.globalMean ?? DEFAULT_GLOBAL_MEAN;
  const v = Math.max(0, votes);
  const R = Math.max(0, Math.min(10, rawScore));

  if (v + m === 0) return C;

  const weighted = (v / (v + m)) * R + (m / (v + m)) * C;
  return Number(weighted.toFixed(2));
}

/**
 * Converts a 10-point score to a 5-star rating (e.g. 9.0 -> 4.5)
 */
export function scoreToStars(scoreOutOf10: number): number {
  const stars = scoreOutOf10 / 2;
  return Number((Math.round(stars * 10) / 10).toFixed(1));
}

/**
 * Returns a human-friendly explanation of why a title has its specific weighted ranking
 */
export function explainBayesianRank(
  votes: number,
  rawScore: number,
  params?: BayesianParams
) {
  const m = params?.minVotes ?? DEFAULT_MIN_VOTES;
  const C = params?.globalMean ?? DEFAULT_GLOBAL_MEAN;
  const weighted = calculateBayesianScore(votes, rawScore, params);
  const starScore = scoreToStars(weighted);
  const confidenceWeight = Number(((votes / (votes + m)) * 100).toFixed(1));

  return {
    votes,
    rawScore,
    minVotesRequired: m,
    globalMeanScore: C,
    weightedScore: weighted,
    starScore,
    confidenceWeightPercent: confidenceWeight,
    explanation:
      votes >= m
        ? `With ${votes.toLocaleString()} votes (well above the ${m.toLocaleString()} threshold), this title carries a ${confidenceWeight}% statistical weight, keeping its rank close to its raw score of ${rawScore}.`
        : `Because this title has ${votes.toLocaleString()} votes (below the ${m.toLocaleString()} threshold), its rating is shrunk toward the catalog average (${C}) to prevent small sample size bias.`,
  };
}

