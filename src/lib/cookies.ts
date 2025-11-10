export const COOKIE_CONSENT_KEY = 'cookie-consent'

export type CookieConsent = {
  accepted: boolean
  timestamp: number
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function getCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  
  const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!consent) return null
  
  try {
    return JSON.parse(consent)
  } catch {
    return null
  }
}

export function setCookieConsent(consent: CookieConsent): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))
}

export function hasCookieConsent(): boolean {
  const consent = getCookieConsent()
  return consent?.accepted === true
}

