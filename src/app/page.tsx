'use client';

import { useRef } from 'react'
import WebcamCapture, { WebcamCaptureRef } from '@/components/WebcamCapture'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useRppgSession } from '@/hooks/useRppgSession'

export default function HeartRateMonitor() {
  const webcamRef = useRef<WebcamCaptureRef>(null)
  const {
    bpm,
    signalQuality,
    isActive,
    error,
    confidence,
    faceDetected,
    startCapture,
    stopCapture,
    resetSession,
  } = useRppgSession()

  const handleStartStop = () => {
    if (isActive) {
      stopCapture()
    } else {
      if (webcamRef.current) {
        startCapture(() => webcamRef.current?.capture() || null)
      }
    }
  }

  const getSignalQualityBg = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'fair': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-800">
            💓 Heart Rate Monitor
          </h1>
          
          {/* Camera Section with BPM Overlay */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
            <div className="relative">
              <WebcamCapture 
                ref={webcamRef}
                isActive={isActive}
                className="w-full"
              />
              
              {/* BPM Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top overlay - BPM Display */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  {/* BPM Reading */}
                  <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl px-3 py-2">
                    <div className="text-white text-center">
                      <div className="text-2xl sm:text-3xl font-bold leading-none">
                        {bpm ? Math.round(bpm) : '--'}
                      </div>
                      <div className="text-xs opacity-80">BPM</div>
                    </div>
                  </div>
                  
                  {/* Signal Quality Indicator */}
                  <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl px-2 py-1">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getSignalQualityBg(signalQuality)} ${
                        signalQuality !== 'unknown' ? 'animate-pulse' : ''
                      }`}></div>
                      <span className="text-white text-xs capitalize">
                        {signalQuality}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Bottom overlay - Status indicators */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  {/* Face Detection Status */}
                  <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${
                        faceDetected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-white text-xs">
                        {faceDetected ? 'Face Detected' : 'No Face'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Confidence Score */}
                  {confidence > 0 && (
                    <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-white text-xs">
                        {Math.round(confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Recording indicator */}
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1 bg-red-500 bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-white text-xs font-medium">REC</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="bg-white rounded-2xl shadow-xl p-4 mb-4">
            <div className="flex flex-col gap-3">
              {/* Main Start/Stop Button */}
              <button
                onClick={handleStartStop}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-lg transition-all ${
                  isActive
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isActive ? '⏹ Stop Monitoring' : '▶️ Start Monitoring'}
              </button>
              
              {/* Secondary controls */}
              <div className="flex gap-2">
                <button
                  onClick={resetSession}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  🔄 Reset
                </button>
                
                {/* Status indicator */}
                <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 rounded-lg">
                  {isActive && <LoadingSpinner size="sm" />}
                  <span className="text-xs text-gray-600">
                    {isActive ? 'Monitoring...' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-sm">⚠️</span>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Instructions:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Position your face in the camera frame</li>
              <li>• Ensure good lighting on your face</li>
              <li>• Stay still for accurate readings</li>
              <li>• Wait 10-15 seconds for stable BPM</li>
            </ul>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
