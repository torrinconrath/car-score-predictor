export enum ScoreRating {
  STEAL = "STEAL! Buy immediately!",
  GREAT_DEAL = "Great deal!",
  GOOD_DEAL = "Good deal",
  ABOVE_AVERAGE = "Above average deal",
  AVERAGE = "Average deal",
  BELOW_AVERAGE = "Below average",
  BAD = "Bad deal",
  OVERPRICED = "Overpriced",
}

export const getScoreRating = (
  score: number
): { rating: ScoreRating; color: string } => {
  if (score <= 35) return { rating: ScoreRating.STEAL, color: "#39e9d6" };
  if (score <= 40) return { rating: ScoreRating.GREAT_DEAL, color: "#1bb641" };
  if (score <= 45) return { rating: ScoreRating.GOOD_DEAL, color: "#6db61b" };
  if (score <= 50) return { rating: ScoreRating.ABOVE_AVERAGE, color: "#a6ce1d" };
  if (score <= 55) return { rating: ScoreRating.AVERAGE, color: "#dcdc1c" };
  if (score <= 60) return { rating: ScoreRating.BELOW_AVERAGE, color: "#dc9f1c" };
  if (score <= 70) return { rating: ScoreRating.BAD, color: "#dc391c" };
  return { rating: ScoreRating.OVERPRICED, color: "#af1c1c" };
};

export default getScoreRating;