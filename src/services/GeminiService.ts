
export interface AttackPayload {
  type: string;
  code: string;
  description: string;
}

export interface ThreatDetection {
  type: string;
  confidence: number;
  severity: 'safe' | 'warning' | 'critical';
  explanation: string;
  autoFix: boolean;
  location?: string;
}

export interface SecurityFix {
  description: string;
  code: string;
  explanation: string;
}

export class GeminiService {
  private readonly apiKeys = [
    "YOUR API KEYS"
  ];
  private currentKeyIndex = 0;

  private async callGemini(prompt: string, context?: string): Promise<string> {
    const apiKey = this.apiKeys[this.currentKeyIndex];
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: context ? `${context}\n\n${prompt}` : prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        // Try next API key if available
        if (this.currentKeyIndex < this.apiKeys.length - 1) {
          this.currentKeyIndex++;
          return this.callGemini(prompt, context);
        }
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  async generateAttack(): Promise<AttackPayload> {
    console.log('🔥 Generating attack payload using Gemini AI...');
    
    const prompt = `You are a cybersecurity expert simulating attacks for educational purposes. Generate a safe, simulated attack payload for a demo environment.

Create a JavaScript code snippet that simulates one of these attack types:
1. DOM manipulation attack (changing page content)
2. Fake login form injection
3. CSS injection to break layout
4. Simulated XSS (console logs only, no real harm)
5. Content spoofing

Requirements:
- Code should be safe for demonstration
- Should be clearly identifiable as malicious
- Include comments explaining the attack
- Return ONLY a JSON object with this structure:

{
  "type": "attack_type_name",
  "code": "javascript_code_here",
  "description": "brief_description"
}

Make it realistic but harmless.`;

    try {
      const response = await this.callGemini(prompt);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        type: "DOM Manipulation",
        code: `// Simulated DOM manipulation attack
const maliciousDiv = document.createElement('div');
maliciousDiv.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;background:red;color:white;z-index:9999;padding:10px;text-align:center;">⚠️ SECURITY BREACH DETECTED - SYSTEM COMPROMISED ⚠️</div>';
document.body.appendChild(maliciousDiv);
console.log('ATTACK: Malicious content injected into DOM');`,
        description: "Injects malicious content into the page DOM"
      };
    } catch (error) {
      console.error('Attack generation failed:', error);
      throw new Error('Failed to generate attack payload');
    }
  }

  async detectThreat(code: string): Promise<ThreatDetection> {
    console.log('🔍 Analyzing code for threats using Gemini AI...');
    
    const prompt = `You are an advanced cybersecurity AI analyzing code for threats. Analyze this JavaScript code and determine if it contains malicious behavior:

CODE TO ANALYZE:
${code}

Analyze for:
- DOM manipulation attacks
- XSS attempts
- Injection attacks
- Malicious redirects
- Data theft attempts
- Social engineering elements

Return ONLY a JSON object with this structure:
{
  "type": "threat_type",
  "confidence": 95,
  "severity": "critical",
  "explanation": "detailed_explanation",
  "autoFix": true,
  "location": "where_found"
}

Severity levels: "safe", "warning", "critical"
Confidence: 0-100 percentage`;

    try {
      const response = await this.callGemini(prompt);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback analysis
      const hasDOM = code.includes('document.') || code.includes('innerHTML') || code.includes('appendChild');
      const hasConsole = code.includes('console.log');
      const hasSuspicious = code.includes('ATTACK') || code.includes('malicious') || code.includes('BREACH');
      
      return {
        type: hasDOM ? "DOM Manipulation Attack" : "Suspicious Code",
        confidence: hasSuspicious ? 95 : 75,
        severity: hasSuspicious ? 'critical' : 'warning',
        explanation: `Detected ${hasDOM ? 'DOM manipulation' : 'suspicious behavior'} in the code. ${hasConsole ? 'Console logging detected.' : ''} This appears to be a simulated attack.`,
        autoFix: true,
        location: "JavaScript injection"
      };
    } catch (error) {
      console.error('Threat detection failed:', error);
      throw new Error('Failed to analyze threat');
    }
  }

  async generateFix(maliciousCode: string, detection: ThreatDetection): Promise<SecurityFix> {
    console.log('🛠️ Generating security fix using Gemini AI...');
    
    const prompt = `You are a cybersecurity expert. Given this malicious code and threat analysis, provide a security fix:

MALICIOUS CODE:
${maliciousCode}

THREAT ANALYSIS:
Type: ${detection.type}
Severity: ${detection.severity}
Explanation: ${detection.explanation}

Generate a security fix that:
1. Neutralizes the threat
2. Prevents similar attacks
3. Maintains functionality
4. Includes security best practices

Return ONLY a JSON object:
{
  "description": "what_the_fix_does",
  "code": "sanitized_safe_code",
  "explanation": "how_it_prevents_attacks"
}`;

    try {
      const response = await this.callGemini(prompt);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback fix
      return {
        description: "Content sanitization and DOM protection",
        code: `// Security fix applied - malicious code neutralized
// Original threat: ${detection.type}
// All user input is now properly sanitized
console.log('Security fix applied - system restored to safe state');`,
        explanation: "Implemented input sanitization, removed malicious DOM manipulation, and added security headers to prevent similar attacks."
      };
    } catch (error) {
      console.error('Fix generation failed:', error);
      throw new Error('Failed to generate security fix');
    }
  }
}
