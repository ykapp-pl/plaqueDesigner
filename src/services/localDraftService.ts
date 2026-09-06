import type { SignProject } from '../domain/signProject'
import { draftProjectSchema } from '../domain/validation'

export const LOCAL_DRAFT_KEY = 'plaque-designer:draft:v1'

export function serializeProject(project: SignProject): string {
  return JSON.stringify(project)
}

export function deserializeProject(serialized: string): SignProject | null {
  try {
    const result = draftProjectSchema.safeParse(JSON.parse(serialized))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function saveLocalDraft(project: SignProject, offerCode?: string): boolean {
  try {
    localStorage.setItem(offerCode ? `${LOCAL_DRAFT_KEY}:${offerCode}` : LOCAL_DRAFT_KEY, serializeProject(project))
    return true
  } catch {
    return false
  }
}

export function loadLocalDraft(offerCode?: string): SignProject | null {
  try {
    const serialized = localStorage.getItem(offerCode ? `${LOCAL_DRAFT_KEY}:${offerCode}` : LOCAL_DRAFT_KEY)
    return serialized ? deserializeProject(serialized) : null
  } catch {
    return null
  }
}
