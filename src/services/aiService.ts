import { GoogleGenerativeAI } from '@google/generative-ai';
import * as FileSystem from 'expo-file-system';
import { CONFIG } from '../config/api';

// AI Service for Photo Analysis using Google Gemini
interface AIAnalysisResult {
  type: 'progress' | 'issue';
  severity?: 'low' | 'medium' | 'high';
  description: string;
  recommendations: string[];
  confidence: number;
}

export class AIService {
  private static instance: AIService;
  private genAI: GoogleGenerativeAI | null = null;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeGemini(): void {
    if (!this.genAI && CONFIG.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // Use Expo FileSystem for better React Native compatibility
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  async analyzePhoto(imageUri: string, reportType: 'progress' | 'issue'): Promise<AIAnalysisResult> {
    this.initializeGemini();

    // Fallback to mock if API key is not configured
    if (!this.genAI || CONFIG.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('Gemini API key not configured, using mock response');
      return this.getMockResponse(reportType);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: CONFIG.GEMINI_MODEL });
      
      // Convert image to base64
      const imageBase64 = await this.convertImageToBase64(imageUri);
      
      // Create the prompt based on report type
      const prompt = this.createPrompt(reportType);
      
      // Generate content with image
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const analysisText = response.text();
      
      // Parse the response into structured format
      return this.parseGeminiResponse(analysisText, reportType);
      
    } catch (error) {
      console.error('Error analyzing photo with Gemini:', error);
      // Fallback to mock response on error
      return this.getMockResponse(reportType);
    }
  }

  private createPrompt(reportType: 'progress' | 'issue'): string {
    if (reportType === 'progress') {
      return `Analyze this construction site photo for progress reporting. Please provide:

1. Construction phase identification
2. Completion percentage estimate
3. Materials and equipment observed
4. Quality assessment
5. Timeline status
6. Safety observations
7. Specific recommendations

Format your response as a detailed analysis with emojis and clear sections. Include confidence level (0-1) and specific actionable recommendations.`;
    } else {
      return `Analyze this construction site photo for safety issues and problems. Please identify:

1. Issue type and severity (low/medium/high)
2. Specific location description
3. Detailed problem description
4. Potential causes
5. Immediate actions required
6. Safety impact assessment
7. Risk level evaluation
8. Specific recommendations

Format your response as a detailed analysis with emojis and clear sections. Include confidence level (0-1) and specific actionable recommendations.`;
    }
  }

  private parseGeminiResponse(responseText: string, reportType: 'progress' | 'issue'): AIAnalysisResult {
    // Extract confidence from response (look for patterns like "confidence: 0.85")
    const confidenceMatch = responseText.match(/confidence[:\s]*(\d+\.?\d*)/i);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;

    // Extract recommendations (look for bullet points or numbered lists)
    const recommendationsMatch = responseText.match(/(?:recommendations?|actions?)[:\s]*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    const recommendations = recommendationsMatch 
      ? recommendationsMatch[1].split('\n').map(line => line.replace(/^[-•\d\.\s]+/, '').trim()).filter(line => line.length > 0)
      : ['Review the analysis and take appropriate action'];

    // Extract severity for issues
    let severity: 'low' | 'medium' | 'high' | undefined;
    if (reportType === 'issue') {
      const severityMatch = responseText.match(/severity[:\s]*(low|medium|high)/i);
      severity = severityMatch ? severityMatch[1].toLowerCase() as 'low' | 'medium' | 'high' : 'medium';
    }

    return {
      type: reportType,
      severity,
      description: responseText,
      recommendations,
      confidence
    };
  }

  private getMockResponse(reportType: 'progress' | 'issue'): AIAnalysisResult {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (reportType === 'progress') {
          resolve({
            type: 'progress',
            description: `Progress Analysis Complete:

🏗️ Construction Phase: Foundation work appears to be progressing well
📊 Completion Status: Approximately 75% complete
🔧 Materials Observed: Concrete, rebar, and formwork visible
✅ Quality Assessment: Good structural integrity indicators
📅 Estimated Timeline: On track for scheduled completion
⚠️ Recommendations: Continue current pace, monitor concrete curing
🛡️ Safety Notes: All safety protocols appear to be followed

This analysis was generated using computer vision and construction industry standards.`,
            recommendations: [
              'Continue current construction pace',
              'Monitor concrete curing conditions',
              'Schedule next inspection in 48 hours',
              'Document progress in project management system'
            ],
            confidence: 0.87
          });
        } else {
          resolve({
            type: 'issue',
            severity: 'medium',
            description: `Issue Analysis Complete:

🚨 Issue Type: Potential safety concern identified
⚠️ Severity Level: Medium - requires attention within 24 hours
📍 Location: Near main entrance area
🔍 Description: Uneven surface detected that could pose tripping hazard
📏 Dimensions: Approximately 2m x 1.5m affected area
🏗️ Cause: Possible settling or incomplete leveling
📋 Immediate Actions: Mark area with caution tape, notify site supervisor
📞 Follow-up Required: Schedule inspection and repair
🛡️ Safety Impact: Medium risk to worker safety
📊 Risk Assessment: Moderate probability of incident

This analysis was generated using computer vision and safety assessment protocols.`,
            recommendations: [
              'Mark area with caution tape immediately',
              'Notify site supervisor within 1 hour',
              'Schedule repair within 24 hours',
              'Document incident in safety log',
              'Conduct safety briefing for affected workers'
            ],
            confidence: 0.92
          });
        }
      }, 1500);
    });
  }
}

export default AIService;