// Types for API responses and data structures

export interface ImageAnalysisResponse {
  bpm: number | null;
  confidence: string;
  face_detected: boolean;
  signal_quality: string;
  timestamp: string;
  session_id?: string;
}

export interface SessionStatusResponse {
  current_bpm: number | null;
  signal_quality: string;
  session_id: string;
  total_frames: number;
  average_confidence: number;
  status: 'active' | 'inactive' | 'completed';
  start_time: string;
  last_update: string;
}

export interface CreateSessionResponse {
  session_id: string;
  status: string;
  created_at: string;
}

export interface RppgSessionState {
  bpm: number | null;
  signalQuality: string;
  isActive: boolean;
  error: string | null;
  sessionId: string | null;
  confidence: number;
  faceDetected: boolean;
}
