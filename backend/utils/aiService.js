const axios = require('axios');

/**
 * AI Service for Resume Analysis (Smarter Simulation & API Integration Ready)
 */
class AIService {
  constructor() {
    this.hfToken = process.env.HUGGING_FACE_TOKEN || '';
    this.gptZeroKey = process.env.GPTZERO_API_KEY || '';
  }

  /**
   * Real-time Hugging Face NLP (Inference API)
   */
  async analyzeWithHuggingFace(text) {
    if (!this.hfToken) return this.simulateDeepAnalysis(text);

    try {
      const model = 'dbmdz/bert-large-cased-finetuned-conll03-english'; 
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: text.substring(0, 4000) },
        { headers: { Authorization: `Bearer ${this.hfToken}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Hugging Face API Error:', error.message);
      return this.simulateDeepAnalysis(text);
    }
  }

  /**
   * Smarter Simulated NLP Analysis (No API Key Required)
   */
  async simulateDeepAnalysis(text) {
    const doc = text.toLowerCase();
    
    // 1. Entity Extraction (Regex)
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/);
    
    // 2. Experience Detection
    const yearMatches = doc.match(/\d+\+?\s*(years|yrs|year)/g);
    let totalYears = 0;
    if (yearMatches) {
      yearMatches.forEach(m => {
        const num = parseInt(m);
        if (num > totalYears) totalYears = num;
      });
    }

    // 3. GPTZero Simulation (Based on unique words vs total words)
    const words = doc.split(/\s+/).length;
    const uniqueWords = new Set(doc.split(/\s+/)).size;
    const perplexityRate = words > 0 ? (uniqueWords / words) : 0;

    return {
      entities: {
        email: emailMatch ? emailMatch[0] : 'Scanning...',
        phone: phoneMatch ? phoneMatch[0] : 'Auto-detected',
        experience: totalYears > 0 ? `${totalYears}+ Years` : 'Early Career'
      },
      gptZero: {
        aiGenerated: perplexityRate < 0.35 ? 'High Prob (Sim)' : 'Low Prob (Sim)',
        humanScore: Math.round(perplexityRate * 120)
      }
    };
  }

  /**
   * Smart Match Score Logic with Enhanced Skill Weights
   */
  calculateSmartMatch(resumeText, jobRequirements) {
    const text = resumeText.toLowerCase();
    const identifiedSkills = [];
    let matches = 0;

    const skillDictionary = {
      tech: ['react', 'node', 'javascript', 'python', 'mongodb', 'sql', 'aws', 'docker', 'typescript', 'ai', 'flutter', 'tailwind'],
      soft: ['communication', 'leadership', 'teamwork', 'agile', 'logic']
    };

    // Match Job Requirements
    jobRequirements.forEach(req => {
      if (text.includes(req.toLowerCase())) {
        matches++;
        identifiedSkills.push(req);
      }
    });

    // Check for general tech skills (Bonus)
    skillDictionary.tech.forEach(t => {
      if (text.includes(t)) {
        if (!identifiedSkills.includes(t.toUpperCase())) {
          identifiedSkills.push(t.toUpperCase());
        }
      }
    });

    const baseScore = jobRequirements.length > 0 
      ? Math.round((matches / jobRequirements.length) * 100) 
      : 70;

    const finalScore = Math.min(100, baseScore + (identifiedSkills.length * 2));

    return { 
      score: finalScore, 
      identifiedSkills: [...new Set(identifiedSkills)].slice(0, 8),
      matchQuality: finalScore > 85 ? 'Exceptional' : finalScore > 65 ? 'Qualified' : 'Foundation'
    };
  }
}

module.exports = new AIService();
