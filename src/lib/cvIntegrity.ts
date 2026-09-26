import { ReviewMarker } from '@/types/athena';

export function formatTimestamp(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export interface CvFrameAnalysis {
  faceCount: number;
  confidenceScore: number;
  markerToLog?: ReviewMarker;
  statusText: string;
  hasVisualAlert: boolean;
  alertType?: 'face_missing' | 'multiple_faces';
  alertMessage?: string;
}

export class CvIntegrityTracker {
  private missingFramesCount = 0;
  private multipleFacesFramesCount = 0;
  private lastMarkerLoggedAt = 0;
  private minSecondsBetweenSimilarMarkers = 8; // debounce repeated markers

  /**
   * Evaluates the MediaPipe detection results for a single frame.
   * Does NOT auto-disqualify. Emits timestamped ReviewMarkers for recruiter review.
   */
  public analyzeFrame(
    landmarksList: any[] | undefined,
    elapsedSeconds: number
  ): CvFrameAnalysis {
    const faceCount = landmarksList ? landmarksList.length : 0;
    const nowTimestamp = formatTimestamp(elapsedSeconds);

    // Scenario 1: Multiple faces detected (> 1)
    if (faceCount > 1) {
      this.missingFramesCount = 0;
      this.multipleFacesFramesCount += 1;

      // After sustained frames (>10 frames ~ 300ms), create a marker if not debounced
      let markerToLog: ReviewMarker | undefined;
      const canLog = (elapsedSeconds - this.lastMarkerLoggedAt) > this.minSecondsBetweenSimilarMarkers;
      
      if (this.multipleFacesFramesCount > 10 && canLog) {
        this.lastMarkerLoggedAt = elapsedSeconds;
        markerToLog = {
          id: `marker-multiface-${Date.now()}`,
          timestamp: nowTimestamp,
          elapsedSeconds,
          type: 'multiple_faces',
          label: 'Multiple Faces in Frame',
          severity: 'high',
          details: `Observable integrity marker: Detected ${faceCount} faces within camera view at ${nowTimestamp}. Flagged for recruiter review.`
        };
      }

      return {
        faceCount,
        confidenceScore: 30, // Drop confidence during multi-face event
        markerToLog,
        statusText: `Multiple faces detected (${faceCount})`,
        hasVisualAlert: true,
        alertType: 'multiple_faces',
        alertMessage: 'Multiple individuals detected in camera view. Activity logged for recruiter review.'
      };
    }

    // Scenario 2: Zero faces detected
    if (faceCount === 0) {
      this.missingFramesCount += 1;
      this.multipleFacesFramesCount = 0;

      let markerToLog: ReviewMarker | undefined;
      const canLog = (elapsedSeconds - this.lastMarkerLoggedAt) > this.minSecondsBetweenSimilarMarkers;

      // Sustained absence (>20 frames ~ 600ms)
      if (this.missingFramesCount > 20 && canLog) {
        this.lastMarkerLoggedAt = elapsedSeconds;
        markerToLog = {
          id: `marker-missing-${Date.now()}`,
          timestamp: nowTimestamp,
          elapsedSeconds,
          type: 'face_missing',
          label: 'Face Missing / Out of Frame',
          severity: 'medium',
          details: `Candidate stepped out of camera frame at ${nowTimestamp}. Flagged for recruiter review.`
        };
      }

      return {
        faceCount: 0,
        confidenceScore: 0,
        markerToLog,
        statusText: 'No face detected in camera',
        hasVisualAlert: true,
        alertType: 'face_missing',
        alertMessage: 'You are currently out of camera view. Please remain in frame.'
      };
    }

    // Scenario 3: Single face normal tracking (faceCount === 1)
    this.missingFramesCount = 0;
    this.multipleFacesFramesCount = 0;

    const landmarks = landmarksList[0];
    const nose = landmarks[1];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    let yawRatio = 1.0;
    if (nose && leftEye && rightEye) {
      const distLeft = Math.abs(nose.x - leftEye.x);
      const distRight = Math.abs(rightEye.x - nose.x);
      yawRatio = Math.min(distLeft, distRight) / (Math.max(distLeft, distRight) || 1);
    }

    let calculatedScore = yawRatio * 100;
    if (yawRatio < 0.6) {
      calculatedScore -= 25; // looking far sideways
    }
    calculatedScore = Math.max(10, Math.min(100, Math.round(calculatedScore)));

    return {
      faceCount: 1,
      confidenceScore: calculatedScore,
      statusText: 'Candidate centered & active',
      hasVisualAlert: false
    };
  }

  public createTabSwitchMarker(elapsedSeconds: number): ReviewMarker {
    const ts = formatTimestamp(elapsedSeconds);
    return {
      id: `marker-tab-${Date.now()}`,
      timestamp: ts,
      elapsedSeconds,
      type: 'tab_switch',
      label: 'Tab Unfocused / Backgrounded',
      severity: 'medium',
      details: `Candidate navigated away or minimized interview tab at ${ts}. Recruiter review recommended.`
    };
  }
}
