from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import httpx
import os
import json
from datetime import datetime
import asyncio

app = FastAPI(title="GitHub Profile Battle API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class GitHubProfile(BaseModel):
    login: str
    name: Optional[str]
    avatar_url: str
    bio: Optional[str]
    company: Optional[str]
    location: Optional[str]
    email: Optional[str]
    blog: Optional[str]
    public_repos: int
    followers: int
    following: int
    created_at: str

class Repository(BaseModel):
    name: str
    description: Optional[str]
    language: Optional[str]
    stargazers_count: int
    forks_count: int
    size: int
    created_at: str
    updated_at: str

class ProfileScore(BaseModel):
    total: float
    activity: float
    quality: float
    impact: float
    consistency: float
    breakdown: Dict[str, int]

class ProfileAnalysis(BaseModel):
    profile: GitHubProfile
    repositories: List[Repository]
    score: ProfileScore
    languages: Dict[str, int]
    top_repos: List[Repository]

class BattleResult(BaseModel):
    winner: str
    loser: str
    winner_analysis: ProfileAnalysis
    loser_analysis: ProfileAnalysis
    insights: List[str]
    recommendations: Dict[str, List[str]]

class BattleRequest(BaseModel):
    username1: str
    username2: str

class ProfileRequest(BaseModel):
    username: str

# GitHub Service
class GitHubService:
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.base_url = "https://api.github.com"
        
    async def get_profile(self, username: str) -> GitHubProfile:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if self.token:
            headers["Authorization"] = f"token {self.token}"
            
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/users/{username}", headers=headers)
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="User not found")
            elif response.status_code != 200:
                raise HTTPException(status_code=400, detail="GitHub API error")
            return GitHubProfile(**response.json())
    
    async def get_repositories(self, username: str) -> List[Repository]:
        headers = {"Accept": "application/vnd.github.v3+json"}
        if self.token:
            headers["Authorization"] = f"token {self.token}"
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/users/{username}/repos",
                headers=headers,
                params={"per_page": 100, "sort": "updated"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to fetch repositories")
            
            repos_data = response.json()
            return [Repository(**repo) for repo in repos_data]
    
    def calculate_languages(self, repositories: List[Repository]) -> Dict[str, int]:
        languages = {}
        for repo in repositories:
            if repo.language:
                languages[repo.language] = languages.get(repo.language, 0) + 1
        return languages
    
    def get_top_repositories(self, repositories: List[Repository]) -> List[Repository]:
        return sorted(repositories, key=lambda x: x.stargazers_count, reverse=True)[:5]
    
    def calculate_score(self, profile: GitHubProfile, repositories: List[Repository], languages: Dict[str, int]) -> ProfileScore:
        total_stars = sum(repo.stargazers_count for repo in repositories)
        total_forks = sum(repo.forks_count for repo in repositories)
        language_count = len(languages)
        
        # Scoring algorithm (0-100 scale)
        activity = min((len(repositories) / 20) * 25, 25)  # Max 25 points
        quality = min((total_stars / 100) * 30, 30)        # Max 30 points  
        impact = min((profile.followers / 50) * 25, 25)    # Max 25 points
        consistency = min((language_count / 8) * 20, 20)   # Max 20 points
        
        total = activity + quality + impact + consistency
        
        return ProfileScore(
            total=total,
            activity=activity,
            quality=quality,
            impact=impact,
            consistency=consistency,
            breakdown={
                "repos": len(repositories),
                "followers": profile.followers,
                "stars": total_stars,
                "forks": total_forks,
                "languages": language_count
            }
        )
    
    async def analyze_profile(self, username: str) -> ProfileAnalysis:
        profile, repositories = await asyncio.gather(
            self.get_profile(username),
            self.get_repositories(username)
        )
        
        languages = self.calculate_languages(repositories)
        top_repos = self.get_top_repositories(repositories)
        score = self.calculate_score(profile, repositories, languages)
        
        return ProfileAnalysis(
            profile=profile,
            repositories=repositories,
            score=score,
            languages=languages,
            top_repos=top_repos
        )

# AI Service
class AIService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"
    
    async def generate_battle_insights(self, profile1: ProfileAnalysis, profile2: ProfileAnalysis) -> BattleResult:
        winner = profile1.profile.login if profile1.score.total > profile2.score.total else profile2.profile.login
        loser = profile2.profile.login if winner == profile1.profile.login else profile1.profile.login
        winner_analysis = profile1 if winner == profile1.profile.login else profile2
        loser_analysis = profile2 if winner == profile1.profile.login else profile1
        
        try:
            insights = await self._call_openrouter_for_insights(profile1, profile2)
            recommendations = await self._call_openrouter_for_recommendations(winner_analysis, loser_analysis)
        except:
            # Fallback insights if AI fails
            insights = self._generate_fallback_insights(profile1, profile2)
            recommendations = self._generate_fallback_recommendations(winner_analysis, loser_analysis)
        
        return BattleResult(
            winner=winner,
            loser=loser,
            winner_analysis=winner_analysis,
            loser_analysis=loser_analysis,
            insights=insights,
            recommendations=recommendations
        )
    
    async def _call_openrouter_for_insights(self, profile1: ProfileAnalysis, profile2: ProfileAnalysis) -> List[str]:
        prompt = f"""
        Compare these two GitHub profiles and provide 3-5 key insights:
        
        Profile 1 ({profile1.profile.login}):
        - Repositories: {len(profile1.repositories)}
        - Followers: {profile1.profile.followers}
        - Total Stars: {profile1.score.breakdown['stars']}
        - Top Languages: {', '.join(list(profile1.languages.keys())[:3])}
        - Score: {profile1.score.total:.1f}
        
        Profile 2 ({profile2.profile.login}):
        - Repositories: {len(profile2.repositories)}
        - Followers: {profile2.profile.followers}
        - Total Stars: {profile2.score.breakdown['stars']}
        - Top Languages: {', '.join(list(profile2.languages.keys())[:3])}
        - Score: {profile2.score.total:.1f}
        
        Provide insights as a JSON array of strings.
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 500
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                try:
                    return json.loads(content)
                except:
                    return content.split('\n')[:5]
            else:
                raise Exception("API call failed")
    
    async def _call_openrouter_for_recommendations(self, winner: ProfileAnalysis, loser: ProfileAnalysis) -> Dict[str, List[str]]:
        prompt = f"""
        Provide improvement recommendations for these GitHub profiles:
        
        Winner ({winner.profile.login}) - Score: {winner.score.total:.1f}
        Loser ({loser.profile.login}) - Score: {loser.score.total:.1f}
        
        Provide 3 recommendations each as JSON with "winner" and "loser" arrays.
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 400
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                try:
                    return json.loads(content)
                except:
                    return {
                        "winner": ["Continue building quality projects", "Engage more with community", "Document your work better"],
                        "loser": ["Focus on project quality over quantity", "Build more visible projects", "Improve documentation"]
                    }
            else:
                raise Exception("API call failed")
    
    def _generate_fallback_insights(self, profile1: ProfileAnalysis, profile2: ProfileAnalysis) -> List[str]:
        insights = []
        
        if profile1.score.total > profile2.score.total:
            insights.append(f"{profile1.profile.login} wins with a score of {profile1.score.total:.1f} vs {profile2.score.total:.1f}")
        else:
            insights.append(f"{profile2.profile.login} wins with a score of {profile2.score.total:.1f} vs {profile1.score.total:.1f}")
        
        if profile1.score.breakdown['stars'] > profile2.score.breakdown['stars']:
            insights.append(f"{profile1.profile.login} has more starred repositories ({profile1.score.breakdown['stars']} vs {profile2.score.breakdown['stars']})")
        
        if profile1.profile.followers > profile2.profile.followers:
            insights.append(f"{profile1.profile.login} has more followers ({profile1.profile.followers} vs {profile2.profile.followers})")
        
        return insights
    
    def _generate_fallback_recommendations(self, winner: ProfileAnalysis, loser: ProfileAnalysis) -> Dict[str, List[str]]:
        return {
            "winner": [
                "Continue building high-quality projects",
                "Share your knowledge through documentation",
                "Engage more with the developer community"
            ],
            "loser": [
                "Focus on creating more impactful repositories",
                "Improve your project documentation and READMEs",
                "Build projects that solve real problems",
                "Contribute to open source projects"
            ]
        }

# Initialize services
github_service = GitHubService(os.getenv("GITHUB_TOKEN"))
ai_service = AIService(os.getenv("OPENROUTER_API_KEY"))

# Routes
@app.get("/")
async def root():
    return {"message": "GitHub Profile Battle API"}

@app.post("/api/battle", response_model=BattleResult)
async def battle_profiles(request: BattleRequest):
    try:
        profile1, profile2 = await asyncio.gather(
            github_service.analyze_profile(request.username1),
            github_service.analyze_profile(request.username2)
        )
        
        result = await ai_service.generate_battle_insights(profile1, profile2)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/analyze", response_model=ProfileAnalysis)
async def analyze_profile(request: ProfileRequest):
    try:
        return await github_service.analyze_profile(request.username)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
