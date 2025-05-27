'use client';

import { useState, useRef, useEffect } from 'react'
import WebcamCapture, { WebcamCaptureRef } from '@/components/WebcamCapture'
import ErrorBoundary from '@/components/ErrorBoundary'

// Simple test page to isolate browser console errors
export default function DebugTest() {
  const [status, setStatus] = useState<string>('Initializing...')
  const webcamRef = useRef<WebcamCaptureRef>(null)

  useEffect(() => {
    console.log('🔍 Debug Test Page: Component mounted')
    setStatus('Component mounted successfully')
    
    // Check for getUserMedia support
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setStatus('getUserMedia supported')
    } else {
      setStatus('getUserMedia NOT supported')
    }
  }, [])

  const testCapture = () => {
    try {
      console.log('🔍 Debug Test: Testing capture...')
      if (webcamRef.current) {
        const result = webcamRef.current.capture()
        if (result) {
          setStatus(`Capture successful: ${result.substring(0, 50)}...`)
          console.log('🔍 Debug Test: Capture successful')
        } else {
          setStatus('Capture failed: No image data')
          console.log('🔍 Debug Test: Capture failed - no image data')
        }
      } else {
        setStatus('Capture failed: No webcam ref')
        console.log('🔍 Debug Test: Capture failed - no webcam ref')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setStatus(`Capture error: ${message}`)
      console.warn('🔍 Debug Test: Capture error:', error)
    }
  }

  const handleCapture = (imageData: string) => {
    console.log('🔍 Debug Test: onCapture called with data length:', imageData.length)
    setStatus(`Auto-capture triggered: ${imageData.length} characters`)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            🔍 Debug Test Page
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <p className="text-sm font-mono bg-gray-100 p-3 rounded">
              {status}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Webcam Test</h2>
            <WebcamCapture 
              ref={webcamRef}
              onCapture={handleCapture}
              isActive={false}
              className="mb-4"
            />
            <button
              onClick={testCapture}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Capture
            </button>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-400">
            <h3 className="font-semibold mb-2">Debug Instructions:</h3>
            <ol className="text-sm space-y-1">
              <li>1. Open browser developer tools (F12)</li>
              <li>2. Check the Console tab for any errors</li>
              <li>3. Allow camera access when prompted</li>
              <li>4. Click &quot;Test Capture&quot; button</li>
              <li>5. Look for debug messages prefixed with 🔍</li>
            </ol>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
