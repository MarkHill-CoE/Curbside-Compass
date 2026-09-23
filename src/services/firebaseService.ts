import {
  serverTimestamp,
  doc,
  setDoc
} from 'firebase/firestore';
import { getDb, ensureAnonymousAuth } from '../lib/firebase';
import { PersonaResult, SimulationConfig } from '../types';

export interface SurveySubmissionData {
  personaId: string;
  personaTitle: string;
  quadrant: string;
  totalX: number;
  totalY: number;
  answers: Record<string, string>;
  simConfig: SimulationConfig;
  rating?: number | null;
  feedback?: string;
  postalCode?: string;
  userAgent?: string;
  timestamp?: unknown;
}

const STORAGE_SESSION_KEY = 'curbside_compass_session_id';

/**
 * Generates a cryptographically strong or secure random session ID with format validation
 */
export function getSessionId(): string {
  try {
    let sid = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sid || !/^sess_[a-zA-Z0-9_-]{8,48}$/.test(sid)) {
      let randPart = '';
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const arr = new Uint8Array(12);
        crypto.getRandomValues(arr);
        randPart = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
      } else {
        randPart = Math.random().toString(36).substring(2, 14) + Date.now().toString(36);
      }
      sid = `sess_${randPart}`;
      localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `sess_${Date.now().toString(36)}`;
  }
}

/**
 * Saves or updates a completed survey & feedback response to Firestore with strict input bounds checking.
 */
export async function saveSurveyResponse(data: {
  persona: PersonaResult;
  totalX: number;
  totalY: number;
  answers: Record<string, string>;
  simConfig: SimulationConfig;
  rating?: number | null;
  feedback?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const db = getDb();
    if (!db) {
      return { success: false, error: 'Firestore is not initialized.' };
    }

    // Input bounds validation (Google standards for defensive persistence)
    const sanitizedTotalX = typeof data.totalX === 'number' && Number.isFinite(data.totalX)
      ? Math.max(-50, Math.min(50, data.totalX))
      : 0;
    const sanitizedTotalY = typeof data.totalY === 'number' && Number.isFinite(data.totalY)
      ? Math.max(-50, Math.min(50, data.totalY))
      : 0;

    const sanitizedRating = typeof data.rating === 'number' && Number.isInteger(data.rating) && data.rating >= 1 && data.rating <= 5
      ? data.rating
      : null;

    const sanitizedFeedback = typeof data.feedback === 'string'
      ? data.feedback.trim().slice(0, 500)
      : '';

    // Sanitize answers dictionary (limit to max 30 keys, 50 chars per key, 100 chars per value)
    const sanitizedAnswers: Record<string, string> = {};
    if (data.answers && typeof data.answers === 'object') {
      const entries = Object.entries(data.answers).slice(0, 30);
      for (const [k, v] of entries) {
        if (typeof k === 'string' && typeof v === 'string') {
          sanitizedAnswers[k.slice(0, 50)] = v.slice(0, 100);
        }
      }
    }

    const rawPostal = sanitizedAnswers['q_demographics_fsa'] || sanitizedAnswers['q_demographics_fsa_input'] || sanitizedAnswers['q9'] || '';
    const cleanPostal = rawPostal.slice(0, 10).replace(/[^a-zA-Z0-9\s-]/g, '').trim();

    // Try ensuring anonymous auth if permitted
    const authUid = await ensureAnonymousAuth();
    const sessionId = getSessionId();

    const submissionDoc: SurveySubmissionData = {
      personaId: String(data.persona.id || '').slice(0, 50),
      personaTitle: String(data.persona.title || '').slice(0, 100),
      quadrant: (['Q1', 'Q2', 'Q3', 'Q4'].includes(data.persona.quadrant) ? data.persona.quadrant : 'Q1'),
      totalX: sanitizedTotalX,
      totalY: sanitizedTotalY,
      answers: sanitizedAnswers,
      simConfig: data.simConfig,
      rating: sanitizedRating,
      feedback: sanitizedFeedback,
      postalCode: cleanPostal,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 200) : '',
      timestamp: serverTimestamp()
    };

    // Use sessionId doc to prevent duplicate submissions per user session, while updating when feedback is submitted
    const docRef = doc(db, 'survey_responses', sessionId);
    await setDoc(docRef, {
      ...submissionDoc,
      authUid: authUid || null,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true, id: sessionId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Firebase] Failed to persist survey response:', msg);
    return { success: false, error: msg };
  }
}
