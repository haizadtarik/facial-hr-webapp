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
  const currentSessionIdRef = useRef<string | null>(null);
  const isActiveRef = useRef<boolean>(false);

  // Update refs when state changes
  useEffect(() => {
    currentSessionIdRef.current = state.sessionId;
    isActiveRef.current = state.isActive;
  }, [state.sessionId, state.isActive]);

  // Initialize session
  const initializeSession = useCallback(async () => {
    try {
      console.log('Attempting to initialize session...');
      setState(prev => ({ ...prev, error: null }));
      const sessionResponse = await apiService.createSession();
      setState(prev => ({ 
        ...prev, 
        sessionId: sessionResponse.session_id,
      }));
      console.log('✅ Session created successfully:', sessionResponse.session_id);
    } catch (error) {
      console.error('❌ Session initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
      }));
      console.warn('Full error details:', error);
    }
  }, []);

  // Process frame buffer
  const processFrameBuffer = useCallback(async () => {
    if (frameBufferRef.current.length === 0 || !currentSessionIdRef.current) return;

    try {
      // Take the latest frame from the buffer
      const latestFrame = frameBufferRef.current[frameBufferRef.current.length - 1];
      frameBufferRef.current = []; // Clear buffer

      const response = await apiService.analyzeImage(latestFrame, currentSessionIdRef.current);
      
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
  }, []);

  // Poll session status
  const pollSessionStatus = useCallback(async () => {
    if (!currentSessionIdRef.current) return;

    try {
      const status = await apiService.getSessionStatus(currentSessionIdRef.current);
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
  }, []);

  // Start capturing
  const startCapture = useCallback(
    (captureCallback: () => string | null) => {
      console.log('🚀 startCapture called, current refs:', { 
        isActive: isActiveRef.current, 
        sessionId: currentSessionIdRef.current ? currentSessionIdRef.current.substring(0, 8) + '...' : 'null' 
      });
      
      if (isActiveRef.current) {
        console.log('❌ Already active, ignoring start request');
        return;
      }

      if (!currentSessionIdRef.current) {
        console.log('❌ No session ID available, cannot start capture');
        setState(prev => ({ ...prev, error: 'No session available. Please refresh the page.' }));
        return;
      }

      captureCallbackRef.current = captureCallback;
      setState(prev => ({ ...prev, isActive: true, error: null }));

      // Start capture interval
      captureIntervalRef.current = setInterval(() => {
        if (captureCallbackRef.current && currentSessionIdRef.current) {
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
      statusPollRef.current = setInterval(() => {
        if (currentSessionIdRef.current) {
          pollSessionStatus();
        }
      }, statusPollInterval);

      console.log('✅ Capture started successfully');
    },
    [captureInterval, statusPollInterval, batchSize, processFrameBuffer, pollSessionStatus]
  );

  // Stop capturing
  const stopCapture = useCallback(() => {
    console.log('🛑 stopCapture called, current refs:', { 
      isActive: isActiveRef.current 
    });
    
    if (!isActiveRef.current) {
      console.log('❌ Already inactive, ignoring stop request');
      return;
    }

    setState(prev => ({ ...prev, isActive: false }));

    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      console.log('✅ Capture interval cleared');
    }

    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
      console.log('✅ Status poll interval cleared');
    }

    // Process any remaining frames
    if (frameBufferRef.current.length > 0) {
      processFrameBuffer();
    }

    captureCallbackRef.current = null;
    console.log('✅ Capture stopped successfully');
  }, [processFrameBuffer]);

  // Reset session
  const resetSession = useCallback(() => {
    stopCapture();
    // Clean up old session
    const sessionToDelete = currentSessionIdRef.current;
    if (sessionToDelete) {
      currentSessionIdRef.current = null; // Clear ref first to prevent duplicate deletions
      apiService.deleteSession(sessionToDelete).catch(() => {
        // Silently handle cleanup failures
      });
    }
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
      // Cleanup function that doesn't depend on state
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      
      if (statusPollRef.current) {
        clearInterval(statusPollRef.current);
        statusPollRef.current = null;
      }
      
      // Clean up session on unmount
      const sessionToDelete = currentSessionIdRef.current;
      if (sessionToDelete) {
        currentSessionIdRef.current = null; // Clear ref first
        apiService.deleteSession(sessionToDelete).catch(() => {
          // Silently handle cleanup failures
        });
      }
    };
  }, [initializeSession]);

  return {
    ...state,
    startCapture,
    stopCapture,
    resetSession,
    initializeSession,
  };
}
