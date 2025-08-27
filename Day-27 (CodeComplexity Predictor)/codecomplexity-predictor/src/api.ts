import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const analyzeCode = (code: string, language = "python") =>
  axios.post(`${BASE_URL}/analyze-code`, { code, language });

export const predictComplexity = (code: string, language = "python") =>
  axios.post(`${BASE_URL}/predict-complexity`, { code, language });

export const startRepoAnalysis = (github_url: string) =>
  axios.post(`${BASE_URL}/analyze-repository`, { github_url, analysis_type: "full" });

export const getAnalysisStatus = (analysis_id: string) =>
  axios.get(`${BASE_URL}/analysis-status/${analysis_id}`);

export const matchDevelopers = (code_snippet: string, required_skills: string[], difficulty_level: string) =>
  axios.post(`${BASE_URL}/match-developers`, { code_snippet, required_skills, difficulty_level });
