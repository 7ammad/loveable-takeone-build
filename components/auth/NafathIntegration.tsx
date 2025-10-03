'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface NafathIntegrationProps {
  onVerificationComplete?: (verified: boolean, nationalId?: string) => void;
}

type VerificationStatus = 'idle' | 'initiating' | 'waiting' | 'success' | 'failed';

export default function NafathIntegration({ onVerificationComplete }: NafathIntegrationProps) {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [transactionId, setTransactionId] = useState<string>('');
  const [randomCode, setRandomCode] = useState<string>('');

  const initiateVerification = async () => {
    setStatus('initiating');
    
    try {
      // TODO: Call actual Nafath API
      // const response = await fetch('/api/v1/auth/nafath/initiate', { method: 'POST' });
      // const data = await response.json();
      
      // Mock response
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockTransactionId = `TX${Date.now()}`;
      const mockRandomCode = Math.floor(10 + Math.random() * 90).toString();
      
      setTransactionId(mockTransactionId);
      setRandomCode(mockRandomCode);
      setStatus('waiting');
      
      // Start polling for verification status
      pollVerificationStatus(mockTransactionId);
    } catch (error) {
      console.error('Failed to initiate Nafath verification:', error);
      setStatus('failed');
    }
  };

  const pollVerificationStatus = async (txId: string) => {
    // TODO: Implement actual polling logic
    // Poll every 3 seconds for up to 2 minutes
    let attempts = 0;
    const maxAttempts = 40;
    
    const poll = setInterval(async () => {
      attempts++;
      
      try {
        // TODO: Call actual status check API
        // const response = await fetch(`/api/v1/auth/nafath/status?transactionId=${txId}`);
        // const data = await response.json();
        
        // Mock: Simulate success after 10 seconds
        if (attempts >= 4) {
          clearInterval(poll);
          setStatus('success');
          onVerificationComplete?.(true, '1234567890');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        setStatus('failed');
        onVerificationComplete?.(false);
      }
    }, 3000);
  };

  const resetVerification = () => {
    setStatus('idle');
    setTransactionId('');
    setRandomCode('');
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">Nafath Verification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Verify your identity using Saudi Arabia's national authentication system
            </p>

            {status === 'idle' && (
              <Button onClick={initiateVerification} className="w-full bg-green-600 hover:bg-green-700">
                <Shield className="w-4 h-4 mr-2" />
                Verify with Nafath
              </Button>
            )}

            {status === 'initiating' && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <p className="text-sm text-foreground">Initiating verification...</p>
              </div>
            )}

            {status === 'waiting' && (
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Open the Nafath app and enter this code:
                  </p>
                  <div className="text-4xl font-bold text-center text-green-600 tracking-wider py-4 bg-green-50 rounded-lg">
                    {randomCode}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Transaction ID: {transactionId}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                    Waiting for confirmation in Nafath app...
                  </p>
                </div>

                <Button variant="outline" onClick={resetVerification} className="w-full">
                  Cancel
                </Button>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-green-100 rounded-lg border border-green-300">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Verification Successful!</p>
                    <p className="text-sm text-green-700">Your identity has been verified</p>
                  </div>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Verification Failed</p>
                    <p className="text-sm text-red-700">Please try again or contact support</p>
                  </div>
                </div>
                <Button onClick={resetVerification} variant="outline" className="w-full">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

