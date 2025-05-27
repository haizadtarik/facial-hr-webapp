'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '@/services/api';
import { RppgSessionState } from '@/types/api';

interface UseRppgSessionOptions {
  captureInterval?: number; // milliseconds between captures (default: 50ms for 20 FPS)
  statusPollInterval?: number; // milliseconds between status polls (default: 2000ms)
  batchSize?: number; // number of frames to capture before sending (default: 10)
}

export function useRppgSession(options: UseRppgSessionOptions = {}) {
  const {
    captureInterval = 50, // 20 FPS
    statusPollInterval = 2000, // 2 seconds
    batchSize = 10,
  } = options;

  const [state, setState] = useState<RppgSessionState>({
    bpm: null,
    signalQuality: 'unknown',
    isActive: false,
    error: null,
    sessionId: null,
    confidence: 0,
    faceDetected: false,
  });

  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);
  const frameBufferRef = useRef<string[]>([]);
  const captureCallbackRef = useRef<(() => string | null) | null>(null);

  // Initialize session
  const initializeSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const sessionResponse = await apiService.createSession();
      setState(prev => ({ 
        ...prev, 
        sessionId: sessionResponse.session_id,
      }));
      console.log('Session created:', sessionResponse.session_id);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create session',
      }));
      console.warn('Session initialization failed:', error);
    }
  }, []);

  // Process frame buffer
  const processFrameBuffer = useCallback(async () => {
    if (frameBufferRef.current.length === 0 || !state.sessionId) return;

    try {
      // Take the latest frame from the buffer
      const latestFrame = frameBufferRef.current[frameBufferRef.current.length - 1];
      frameBufferRef.current = []; // Clear buffer

      const response = await apiService.analyzeImage(latestFrame, state.sessionId);
      
      setState(prev => ({
        ...prev,
        bpm: response.bpm,
        signalQuality: response.signal_quality,
        confidence: parseFloat(response.confidence) || 0,
        faceDetected: response.face_detected,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to analyze frame',
      }));
      console.warn('Frame processing failed:', error);
    }
  }, [state.sessionId]);

  // Poll session status
  const pollSessionStatus = useCallback(async () => {
    if (!state.sessionId) return;

    try {
      const status = await apiService.getSessionStatus(state.sessionId);
      setState(prev => ({
        ...prev,
        bpm: status.current_bpm || prev.bpm,
        signalQuality: status.signal_quality,
        error: null,
      }));
    } catch (error) {
      console.warn('Status polling failed:', error);
      // Don't update error state for polling failures to avoid spam
    }
  }, [state.sessionId]);

  // Start capturing
  const startCapture = useCallback(
    (captureCallback: () => string | null) => {
      if (state.isActive) return;

      captureCallbackRef.current = captureCallback;
      setState(prev => ({ ...prev, isActive: true, error: null }));

      // Start capture interval
      captureIntervalRef.current = setInterval(() => {
        if (captureCallbackRef.current) {
          const frame = captureCallbackRef.current();
          if (frame) {
            frameBufferRef.current.push(frame);
            
            // Process buffer when it reaches batch size
            if (frameBufferRef.current.length >= batchSize) {
              processFrameBuffer();
            }
          }
        }
      }, captureInterval);

      // Start status polling
      statusPollRef.current = setInterval(pollSessionStatus, statusPollInterval);

      console.log('Capture started');
    },
    [state.isActive, captureInterval, statusPollInterval, batchSize, processFrameBuffer, pollSessionStatus]
  );

  // Stop capturing
  const stopCapture = useCallback(() => {
    if (!state.isActive) return;

    setState(prev => ({ ...prev, isActive: false }));

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
    }

    // Process any remaining frames
    if (frameBufferRef.current.length > 0) {
      processFrameBuffer();
    }

    captureCallbackRef.current = null;
    console.log('Capture stopped');
  }, [state.isActive, processFrameBuffer]);

  // Reset session
  const resetSession = useCallback(() => {
    stopCapture();
    setState({
      bpm: null,
      signalQuality: 'unknown',
      isActive: false,
      error: null,
      sessionId: null,
      confidence: 0,
      faceDetected: false,
    });
    frameBufferRef.current = [];
  }, [stopCapture]);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    
    return () => {
      stopCapture();
    };
  }, [initializeSession, stopCapture]);

  return {
    ...state,
    startCapture,
    stopCapture,
    resetSession,
    initializeSession,
  };
}
