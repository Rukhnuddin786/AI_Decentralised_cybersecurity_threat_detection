
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, AlertTriangle, Shield, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GeminiService } from '@/services/GeminiService';
import { toast } from 'sonner';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: Date;
  isAttack?: boolean;
  isFixed?: boolean;
}

interface VulnerableWidgetProps {
  isAttackMode: boolean;
  attackLogs: any[];
}

const VulnerableWidget: React.FC<VulnerableWidgetProps> = ({ isAttackMode, attackLogs }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, user: 'System', text: 'Welcome to the demo chat! This is a sandbox environment.', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isInjected, setIsInjected] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [injectedContent, setInjectedContent] = useState('');
  const [currentThreat, setCurrentThreat] = useState<any>(null);
  const [isFixing, setIsFixing] = useState(false);
  const [geminiService] = useState(() => new GeminiService());

  useEffect(() => {
    if (isAttackMode && attackLogs.length > 0) {
      const latestLog = attackLogs[0];
      if (latestLog.status === 'injected' && latestLog.payload) {
        // Simulate malicious injection
        setIsInjected(true);
        setInjectedContent(latestLog.payload);
        
        // Add malicious message to chat
        setMessages(prev => [...prev, {
          id: Date.now(),
          user: 'MALICIOUS_SCRIPT',
          text: '🚨 SYSTEM COMPROMISED - Unauthorized access detected!',
          timestamp: new Date(),
          isAttack: true
        }]);
      }
      
      if (latestLog.status === 'detected' && latestLog.detection) {
        setCurrentThreat(latestLog.detection);
      }
      
      if (latestLog.status === 'fixed') {
        setIsInjected(false);
        setInjectedContent('');
        setCurrentThreat(null);
        setMessages(prev => [...prev, {
          id: Date.now(),
          user: 'Security AI',
          text: '✅ Threat neutralized. System restored to safe state.',
          timestamp: new Date(),
          isFixed: true
        }]);
      }
    }
  }, [isAttackMode, attackLogs]);

  const handleFixThreat = async () => {
    if (!currentThreat || !injectedContent) return;
    
    setIsFixing(true);
    try {
      toast.info("🛠️ Generating AI-powered security fix...");
      
      const fix = await geminiService.generateFix(injectedContent, currentThreat);
      
      // Apply the fix
      setIsInjected(false);
      setInjectedContent('');
      setCurrentThreat(null);
      
      // Add fix message to chat
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: 'Security AI',
        text: `✅ Threat fixed: ${fix.description}`,
        timestamp: new Date(),
        isFixed: true
      }]);
      
      toast.success("✅ Threat successfully neutralized!");
      
    } catch (error) {
      toast.error("Failed to generate fix: " + error.message);
    } finally {
      setIsFixing(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: 'User',
      text: inputValue,
      timestamp: new Date()
    }]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      case 'safe': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div ref={widgetRef} className="space-y-4">
      {/* Chat Interface */}
      <Card className="bg-gray-800/50 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <span>Demo Chat Component</span>
            {isInjected && (
              <div className="ml-auto flex items-center space-x-2 text-red-400 animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">INFECTED</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="h-48 overflow-y-auto space-y-2 p-3 bg-gray-900/50 rounded border border-gray-700">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`p-2 rounded text-sm ${
                  message.isAttack ? 'bg-red-900/50 border border-red-500 text-red-200' :
                  message.isFixed ? 'bg-green-900/50 border border-green-500 text-green-200' :
                  message.user === 'User' ? 'bg-blue-900/30 text-blue-200' : 'bg-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-xs opacity-75">{message.user}</span>
                  <span className="text-xs opacity-50">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1">{message.text}</div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-gray-800 border-gray-600 text-white"
              disabled={isInjected}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isInjected}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Threat Analysis Display */}
      {currentThreat && (
        <Card className="bg-yellow-900/20 border-yellow-500 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400 text-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Threat Analysis</span>
              <Badge variant="outline" className={`${getSeverityColor(currentThreat.severity)} text-white ml-auto`}>
                {currentThreat.severity.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-300">Threat Type:</span>
                <p className="text-white">{currentThreat.type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-300">Confidence:</span>
                <p className="text-white">{currentThreat.confidence}%</p>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-300">Analysis:</span>
              <p className="text-white text-sm mt-1 p-3 bg-gray-900/50 rounded border border-gray-700">
                {currentThreat.explanation}
              </p>
            </div>
            
            {currentThreat.location && (
              <div>
                <span className="text-sm font-medium text-gray-300">Location:</span>
                <p className="text-white">{currentThreat.location}</p>
              </div>
            )}
            
            <div className="flex space-x-3 pt-2">
              <Button 
                onClick={handleFixThreat}
                disabled={isFixing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isFixing ? (
                  <>
                    <Wrench className="w-4 h-4 mr-2 animate-spin" />
                    Generating Fix...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
                    Fix with AI
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="border-gray-600 hover:bg-gray-800">
                <Shield className="w-4 h-4 mr-2" />
                Manual Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulated Attack Injection Display */}
      {isInjected && injectedContent && (
        <Card className="bg-red-900/20 border-red-500 border-2 animate-pulse">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-400 text-sm flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Injected Malicious Code (Simulation)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 p-3 rounded border border-red-500 font-mono text-xs text-red-300 whitespace-pre-wrap">
              {injectedContent}
            </div>
            <div className="mt-2 text-xs text-red-400">
              ⚠️ This is a simulated attack in a safe sandbox environment
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Status */}
      <div className="text-xs text-gray-500 text-center">
        Sandbox Status: {isInjected ? '🔴 COMPROMISED' : '🟢 SECURE'} | 
        Runtime: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default VulnerableWidget;
