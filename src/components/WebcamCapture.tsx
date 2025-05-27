'use client';

import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';

export interface WebcamCaptureRef {
  capture: () => string | null;
}

interface WebcamCaptureProps {
  onCapture?: (imageSrc: string) => void;
  isActive?: boolean;
  className?: string;
}

const WebcamCapture = forwardRef<WebcamCaptureRef, WebcamCaptureProps>(
  ({ onCapture, isActive = false, className = '' }, ref) => {
    const webcamRef = useRef<Webcam>(null);

    const capture = useCallback((): string | null => {
      try {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc && onCapture) {
          onCapture(imageSrc);
        }
        return imageSrc || null;
      } catch (error) {
        console.warn('WebcamCapture: Failed to capture screenshot', error);
        return null;
      }
    }, [onCapture]);

    useImperativeHandle(ref, () => ({
      capture,
    }));

    const videoConstraints = {
      width: 640,
      height: 480,
      facingMode: 'user',
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleUserMedia = (stream: MediaStream) => {
      // Camera access granted successfully
      console.log('WebcamCapture: Camera access granted');
    };

    const handleUserMediaError = (error: string | DOMException) => {
      console.warn('WebcamCapture: Camera access failed', error);
    };

    return (
      <div className={`relative ${className}`}>
        <Webcam
          ref={webcamRef}
          audio={false}
          height={480}
          width={640}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-lg shadow-lg"
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
        />
        
        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          <div
            className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
              isActive 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-gray-400'
            }`}
          />
        </div>

        {/* Overlay for face detection area */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-2 border-transparent rounded-lg">
            {/* Face detection guide */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-48 h-64 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  Position face here
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WebcamCapture.displayName = 'WebcamCapture';

export default WebcamCapture;
