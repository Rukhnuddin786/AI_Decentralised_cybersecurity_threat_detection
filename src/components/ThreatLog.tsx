
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Shield, Bug, CheckCircle, AlertTriangle } from 'lucide-react';

interface ThreatLogProps {
  logs: any[];
}

const ThreatLog: React.FC<ThreatLogProps> = ({ logs }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'injected':
        return <Bug className="w-4 h-4 text-red-400" />;
      case 'detected':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'fixed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'injected':
        return 'bg-red-600';
      case 'detected':
        return 'bg-yellow-600';
      case 'fixed':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-cyan-400">
          <Activity className="w-5 h-5" />
          <span>Threat Log</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No threats detected</p>
              <p className="text-xs mt-1">System is secure</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-3 bg-gray-800/50 rounded border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <Badge variant="outline" className={`${getStatusColor(log.status)} text-white text-xs`}>
                        {log.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-300">
                      <span className="font-medium">Type:</span> {log.type || 'Unknown'}
                    </div>
                    
                    {log.detection && (
                      <div className="text-gray-300">
                        <span className="font-medium">Confidence:</span> {log.detection.confidence}%
                      </div>
                    )}
                    
                    {log.detection?.explanation && (
                      <div className="text-gray-400 text-xs mt-2 p-2 bg-gray-900/50 rounded">
                        {log.detection.explanation}
                      </div>
                    )}
                    
                    {log.fix && (
                      <div className="text-green-400 text-xs mt-2 p-2 bg-green-900/20 rounded border border-green-800">
                        <span className="font-medium">Fix Applied:</span> {log.fix.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ThreatLog;
