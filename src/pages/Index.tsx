
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Activity, Bug, Zap, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VulnerableWidget from '@/components/VulnerableWidget';
import ThreatLog from '@/components/ThreatLog';
import { GeminiService } from '@/services/GeminiService';
import { toast } from 'sonner';

const Index = () => {
  const [isAttackMode, setIsAttackMode] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'safe' | 'warning' | 'critical'>('safe');
  const [attackLogs, setAttackLogs] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [geminiService] = useState(() => new GeminiService());

  const handleSimulateAttack = async () => {
    setIsAttackMode(true);
    setIsScanning(true);
    
    try {
      toast.info("🔥 Initiating attack simulation...");
      
      // Generate malicious payload using Gemini
      const attackPayload = await geminiService.generateAttack();
      
      // Inject the attack into vulnerable component
      const attackEvent = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: attackPayload.type,
        payload: attackPayload.code,
        status: 'injected'
      };
      
      setAttackLogs(prev => [attackEvent, ...prev]);
      
      // Simulate attack injection
      setTimeout(async () => {
        // Detect the threat
        const detection = await geminiService.detectThreat(attackPayload.code);
        
        const detectionEvent = {
          ...attackEvent,
          id: Date.now() + 1,
          status: 'detected',
          detection: detection,
          threatLevel: detection.severity
        };
        
        setAttackLogs(prev => [detectionEvent, ...prev.slice(1)]);
        setThreatLevel(detection.severity);
        
        toast.error(`🚨 ${detection.type} detected! Confidence: ${detection.confidence}%`);
        
        // Auto-fix if requested
        if (detection.autoFix) {
          setTimeout(async () => {
            const fix = await geminiService.generateFix(attackPayload.code, detection);
            
            const fixEvent = {
              ...detectionEvent,
              id: Date.now() + 2,
              status: 'fixed',
              fix: fix
            };
            
            setAttackLogs(prev => [fixEvent, ...prev.slice(1)]);
            setThreatLevel('safe');
            toast.success("✅ Threat neutralized automatically!");
          }, 2000);
        }
      }, 1500);
      
    } catch (error) {
      toast.error("Attack simulation failed: " + error.message);
    } finally {
      setIsScanning(false);
    }
  };

  const resetSandbox = () => {
    setIsAttackMode(false);
    setThreatLevel('safe');
    toast.info("🔄 Sandbox reset to safe state");
  };

  const getThreatColor = () => {
    switch (threatLevel) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-green-500 bg-green-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                CyberGuard AI
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={threatLevel === 'safe' ? 'default' : 'destructive'} className="text-sm">
                {threatLevel === 'safe' && <Shield className="w-4 h-4 mr-1" />}
                {threatLevel === 'warning' && <AlertTriangle className="w-4 h-4 mr-1" />}
                {threatLevel === 'critical' && <Bug className="w-4 h-4 mr-1" />}
                Threat Level: {threatLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-400">
                  <Zap className="w-5 h-5" />
                  <span>Attack Simulation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleSimulateAttack}
                  disabled={isScanning}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  {isScanning ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Attacking...
                    </>
                  ) : (
                    <>
                      <Bug className="w-4 h-4 mr-2" />
                      Simulate Cyber Attack
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={resetSandbox}
                  variant="outline"
                  className="w-full border-gray-600 hover:bg-gray-800"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Reset Sandbox
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-400">
                  <Eye className="w-5 h-5" />
                  <span>AI Detection Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Gemini AI Scanner</span>
                    <Badge variant="default" className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Real-time Monitoring</span>
                    <Badge variant="default" className="bg-green-600">Enabled</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Auto-remediation</span>
                    <Badge variant="default" className="bg-blue-600">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ThreatLog logs={attackLogs} />
          </div>

          {/* Vulnerable Component Sandbox */}
          <div className="lg:col-span-2">
            <Card className={`${getThreatColor()} border-2 transition-all duration-300`}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    threatLevel === 'safe' ? 'bg-green-400' : 
                    threatLevel === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  } animate-pulse`} />
                  <span>Vulnerable Component Sandbox</span>
                  {threatLevel !== 'safe' && (
                    <Badge variant="destructive" className="ml-auto">
                      COMPROMISED
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-950/80 rounded-lg p-4 border border-gray-700">
                  <VulnerableWidget 
                    isAttackMode={isAttackMode}
                    attackLogs={attackLogs}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
