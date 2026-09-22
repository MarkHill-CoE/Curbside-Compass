import {
  collection,
  addDoc,
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

export function getSessionId(): string {
  try {
    let sid = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      localStorage.setItem(STORAGE_SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return 'sess_' + Date.now().toString(36);
  }
}

/**
 * Saves or updates a completed survey & feedback response to Firestore.
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

    // Try ensuring anonymous auth if permitted
    const authUid = await ensureAnonymousAuth();
    const sessionId = getSessionId();

    const submissionDoc: SurveySubmissionData = {
      personaId: data.persona.id,
      personaTitle: data.persona.title,
      quadrant: data.persona.quadrant,
      totalX: data.totalX,
      totalY: data.totalY,
      answers: data.answers,
      simConfig: data.simConfig,
      rating: data.rating !== undefined ? data.rating : null,
      feedback: data.feedback ? data.feedback.trim() : '',
      postalCode: data.answers['q_demographics_fsa'] || data.answers['q_demographics_fsa_input'] || '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
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
