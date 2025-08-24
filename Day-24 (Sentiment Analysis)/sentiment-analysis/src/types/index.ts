export interface SentimentRequest {
  text: string;
}

export interface SentimentResponse {
  text: string;
  label: string;
  score: number;
}
