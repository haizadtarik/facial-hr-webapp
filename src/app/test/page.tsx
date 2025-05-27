'use client';

import { useState, useRef } from 'react'
import WebcamCapture, { WebcamCaptureRef } from '@/components/WebcamCapture'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function IntegrationTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [frameCount, setFrameCount] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const webcamRef = useRef<WebcamCaptureRef>(null)

  const handleCapture = async (imageData: string) => {
    if (isLoading) return

    setIsLoading(true)
    setFrameCount(prev => prev + 1)

    try {
      console.log(`📸 Captured frame ${frameCount + 1}:`, imageData.substring(0, 50) + '...')
      
      // Validate image data
      if (!imageData || !imageData.includes('data:image')) {
        throw new Error('Invalid image data received from webcam')
      }
      
      // Test frame capture
      setTestResult(prev => prev + `\n✅ Frame ${frameCount + 1} captured successfully (${imageData.length} chars)`)
      
      // Test the API with this frame
      setTestResult(prev => prev + '\n🧪 Testing API with captured frame...')
      
      const base64Data = imageData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
      if (!base64Data) {
        throw new Error('Failed to extract base64 data from image')
      }
      
      const response = await fetch('http://localhost:8000/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_data: base64Data,
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const result = await response.json()
      setTestResult(prev => prev + `\n✅ API Response: Face detected: ${result.face_detected}, BPM: ${result.bpm || 'N/A'}, Confidence: ${result.confidence || 'N/A'}`)
      
    } catch (error) {
      console.warn('Frame handling error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setTestResult(prev => prev + `\n❌ Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const startContinuousCapture = () => {
    if (isCapturing) return // Prevent multiple instances
    
    setIsCapturing(true)
    setTestResult('🎥 Starting continuous capture test...')
    
    const captureInterval = setInterval(() => {
      try {
        if (webcamRef.current && frameCount < 5) {
          const frame = webcamRef.current.capture()
          if (frame) {
            handleCapture(frame)
          } else {
            setTestResult(prev => prev + '\n⚠️ Failed to capture frame - webcam might not be ready')
          }
        } else {
          clearInterval(captureInterval)
          setIsCapturing(false)
          setTestResult(prev => prev + '\n🏁 Continuous capture test completed!')
        }
      } catch (error) {
        console.warn('Continuous capture error:', error)
        setTestResult(prev => prev + `\n❌ Capture error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        clearInterval(captureInterval)
        setIsCapturing(false)
      }
    }, 2000) // Capture every 2 seconds
  }

  const captureManual = () => {
    try {
      if (webcamRef.current) {
        const frame = webcamRef.current.capture()
        if (frame) {
          handleCapture(frame)
        } else {
          setTestResult(prev => prev + '\n❌ Failed to capture frame - webcam might not be ready or access denied')
        }
      } else {
        setTestResult(prev => prev + '\n❌ Webcam reference not available')
      }
    } catch (error) {
      console.warn('Manual capture error:', error)
      setTestResult(prev => prev + `\n❌ Capture error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const resetTest = () => {
    setTestResult('')
    setFrameCount(0)
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 Integration Test
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Camera Test</h2>
            <WebcamCapture 
              ref={webcamRef}
              onCapture={handleCapture}
              isActive={isCapturing}
              className="mb-4"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={captureManual}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                📸 Capture Now
              </button>
              <button
                onClick={startContinuousCapture}
                disabled={isCapturing || isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                🎥 Start Auto Capture
              </button>
              <button
                onClick={resetTest}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                🔄 Reset Test
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {isLoading && <LoadingSpinner size="sm" />}
              <span className="text-sm text-gray-600">
                Frames captured: {frameCount}
              </span>
              {isCapturing && (
                <span className="text-sm text-blue-600 animate-pulse">
                  Auto-capturing...
                </span>
              )}
            </div>
          </div>
          
          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {testResult || 'Point your camera at your face and wait for frame capture...'}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Allow camera access when prompted</li>
            <li>Position your face in the camera frame (follow the blue guide)</li>
            <li>Click &quot;📸 Capture Now&quot; for manual testing</li>
            <li>Click &quot;🎥 Start Auto Capture&quot; for automated testing (captures 5 frames)</li>
            <li>Check the results panel for API responses and face detection</li>
            <li>Look for BPM readings and confidence scores</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>Expected Results:</strong> Each capture should show face detection status, 
              and if a face is detected, you should see BPM calculations and confidence scores 
              from the rPPG algorithm.
            </p>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  )
}
