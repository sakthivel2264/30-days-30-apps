
import type { OpenRouterResponse, GeneratedText } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export class OpenRouterService {
  static async generateTypingText(
    category: string, 
    difficulty: string,
    wordCount: number = 100
  ): Promise<GeneratedText> {
    if (!API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const difficultyPrompts = {
      easy: 'Use simple, common words and basic sentence structures. Focus on everyday vocabulary.',
      medium: 'Use moderate vocabulary with some complex words and varied sentence structures.',
      hard: 'Use advanced vocabulary, complex sentence structures, and technical or specialized terms.'
    };

    const categoryPrompts = {
      general: 'Write about everyday topics like hobbies, nature, travel, or daily life',
      tech: 'Write about technology, programming, software development, or digital innovations',
      literature: 'Write in a literary style about books, writing, philosophy, or creative expression',
      news: 'Write in a news article style about current events, society, or world affairs',
      quotes: 'Generate inspirational quotes and motivational sayings from various famous personalities'
    };

    const prompt = `Generate a typing practice paragraph for a typing speed test with exactly ${wordCount} words.

    Category: ${category}
    Difficulty: ${difficulty}
    
    Requirements:
    - Write exactly ${wordCount} words
    - ${difficultyPrompts[difficulty as keyof typeof difficultyPrompts]}
    - ${categoryPrompts[category as keyof typeof categoryPrompts]}
    - Use proper punctuation and capitalization
    - Make it engaging and coherent
    - Avoid repetitive words or phrases
    - Include a mix of short and longer words appropriate for the difficulty level
    
    Return ONLY the paragraph text, no additional formatting or quotes.`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Typing Speed Tester'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 500,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: OpenRouterResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No content received from API');
      }

      return {
        text: content.trim().replace(/^"|"$/g, ''), // Remove quotes if present
        category,
        difficulty
      };
    } catch (error) {
      console.error('Error generating typing text:', error);
      
      // Fallback texts for each category and difficulty
      const fallbackTexts = {
        general: {
          easy: "The sun rises in the east every morning. Birds sing beautiful songs in the trees. Children love to play games in the park. Fresh flowers bloom in the spring. People enjoy walking their dogs. Ice cream tastes great on hot summer days. Books help us learn new things. Music makes us feel happy and relaxed.",
          medium: "Technology continues to reshape our modern world in unprecedented ways. Social media platforms connect billions of people across different continents. Environmental conservation efforts require global cooperation and sustainable practices. Educational institutions adapt to digital learning methodologies. Cultural diversity enriches our understanding of humanity.",
          hard: "Sophisticated algorithms orchestrate intricate computational processes, facilitating unprecedented technological paradigms. Quantum mechanics challenges conventional perceptions of reality through counterintuitive phenomena. Interdisciplinary collaboration fosters innovative solutions to complex societal challenges. Philosophical discourse examines fundamental questions regarding consciousness and existence."
        },
        tech: {
          easy: "Computers help us work and play games. Mobile phones let us call friends. The internet connects people worldwide. Apps make tasks easier to do. Software programs run on devices. Code tells computers what to do. Websites show information online. Email sends messages quickly.",
          medium: "Machine learning algorithms analyze vast datasets to identify patterns and generate insights. Cloud computing provides scalable infrastructure for modern applications. Cybersecurity professionals protect digital assets from malicious attacks. Agile development methodologies streamline software project management. API integration enables seamless communication between different systems.",
          hard: "Distributed microservices architectures leverage containerization technologies to achieve horizontal scalability and fault tolerance. Blockchain consensus mechanisms utilize cryptographic hashing to ensure immutable transaction ledgers. Neural network architectures implement backpropagation algorithms for supervised learning optimization."
        },
        literature: {
          easy: "Stories take us to magical places. Heroes go on exciting adventures. Love makes people do brave things. Books teach us about life. Words paint pictures in our minds. Poems share deep feelings. Writers create new worlds. Reading opens doors to imagination.",
          medium: "Literary masterpieces illuminate the human condition through compelling narratives and profound character development. Symbolism and metaphorical language convey deeper meanings beyond surface interpretations. Classic novels explore timeless themes of love, loss, redemption, and moral complexity. Poetry distills emotions into carefully crafted verses.",
          hard: "Postmodern literary criticism deconstructs traditional narrative structures, challenging hegemonic interpretations through intertextual analysis. Magical realism transcends conventional boundaries between fantasy and verisimilitude, creating liminal spaces for cultural exploration. Metafictional techniques foreground the artifice of storytelling itself."
        },
        news: {
          easy: "Local news reports on community events. Weather forecasts help people plan their day. Sports teams compete in exciting games. Election results show who won. Traffic reports warn about road delays. School events bring families together. Health tips keep people safe.",
          medium: "International diplomatic negotiations address complex geopolitical tensions across multiple regions. Economic indicators suggest fluctuating market conditions affecting global trade relationships. Scientific research breakthroughs advance medical treatment possibilities. Environmental policies balance economic development with conservation efforts.",
          hard: "Geopolitical machinations involving multilateral treaty negotiations demonstrate the intricate balance between sovereignty and international cooperation. Macroeconomic indicators reveal systemic vulnerabilities within interconnected global financial markets. Epidemiological surveillance networks monitor pathogen transmission patterns across demographic boundaries."
        },
        quotes: {
          easy: "Dream big and work hard every day. Be kind to others and yourself. Success comes to those who try. Every day is a new chance. Believe in yourself and your dreams. Hard work always pays off. Stay positive through tough times.",
          medium: "Excellence is not a destination but a continuous journey of improvement. Innovation requires courage to challenge conventional thinking. Leadership involves inspiring others to achieve their potential. Perseverance transforms obstacles into opportunities for growth. Wisdom emerges from learning through both success and failure.",
          hard: "Transcendental contemplation reveals the ephemeral nature of material pursuits while illuminating the perpetual quest for authentic self-actualization. Philosophical introspection facilitates the reconciliation of existential paradoxes inherent in the human experience. Intellectual curiosity catalyzes transformative paradigm shifts."
        }
      };

      const fallbackText = fallbackTexts[category as keyof typeof fallbackTexts]?.[difficulty as PropertyKey] || 
                          fallbackTexts.general.easy;
      
      return {
        text: fallbackText,
        category,
        difficulty
      };
    }
  }
}
