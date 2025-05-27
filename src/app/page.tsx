'use client';

import React, { useRef, useEffect } from 'react';
import WebcamCapture, { WebcamCaptureRef } from '@/components/WebcamCapture';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRppgSession } from '@/hooks/useRppgSession';

export default function Home() {
  const webcamRef = useRef<WebcamCaptureRef>(null);
  const {
    bpm,
    signalQuality,
    isActive,
    error,
    sessionId,
    confidence,
    faceDetected,
    startCapture,
    stopCapture,
    resetSession,
  } = useRppgSession();

  // Debug logging for integration testing
  useEffect(() => {
    console.log('🔍 rPPG Session State Update:', {
      bpm,
      signalQuality,
      isActive,
      error,
      sessionId: sessionId ? `${sessionId.substring(0, 8)}...` : null,
      confidence,
      faceDetected,
    });
  }, [bpm, signalQuality, isActive, error, sessionId, confidence, faceDetected]);

  const handleStartCapture = () => {
    if (webcamRef.current) {
      startCapture(() => webcamRef.current?.capture() || null);
    }
  };

  const handleStopCapture = () => {
    stopCapture();
  };

  const getSignalQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'fair':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getBpmDisplayColor = (bpm: number | null) => {
    if (!bpm) return 'text-gray-400';
    if (bpm < 60) return 'text-blue-500';
    if (bpm <= 100) return 'text-green-500';
    if (bpm <= 120) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            rPPG Heart Rate Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time heart rate detection using facial video analysis
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Webcam Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Camera Feed
              </h2>
              
              <div className="flex justify-center mb-4">
                {!sessionId ? (
                  <div className="w-full max-w-md h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <LoadingSpinner text="Initializing session..." />
                  </div>
                ) : (
                  <WebcamCapture
                    ref={webcamRef}
                    isActive={isActive}
                    className="w-full max-w-md"
                  />
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleStartCapture}
                  disabled={isActive || !sessionId}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isActive ? (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      Recording
                    </>
                  ) : (
                    'Start Monitoring'
                  )}
                </button>
                
                <button
                  onClick={handleStopCapture}
                  disabled={!isActive}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  Stop
                </button>
                
                <button
                  onClick={resetSession}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                Vital Signs
              </h2>

              {/* Heart Rate Display */}
              <div className="mb-6">
                <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Heart Rate
                  </div>
                  <div className={`text-5xl font-bold ${getBpmDisplayColor(bpm)}`}>
                    {bpm ? `${bpm}` : '--'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    BPM
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Signal Quality
                  </div>
                  <div className={`font-semibold capitalize ${getSignalQualityColor(signalQuality)}`}>
                    {signalQuality}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Confidence
                  </div>
                  <div className="font-semibold text-gray-800 dark:text-white">
                    {(confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Additional Status */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Face Detected</span>
                  <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Session Status</span>
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>

                {sessionId && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Session ID
                    </div>
                    <div className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                      {sessionId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-600 dark:text-red-400">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 dark:text-red-200 font-medium">Error</h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Instructions
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Position your face within the dashed outline on the camera feed
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Ensure good lighting conditions for optimal detection
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Stay still and look directly at the camera
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                Wait 10-15 seconds for the algorithm to stabilize
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
