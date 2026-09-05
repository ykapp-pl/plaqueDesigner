export function isOfferCode(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{32}$/.test(value)
}

export interface OfferPolicy {
  size_id: string
  background_enabled: boolean
  premium_available: boolean
}

export function matchesOffer(configuration: any, offer: OfferPolicy): boolean {
  if (!configuration || configuration.sizeId !== offer.size_id ||
      configuration.backgroundEnabled !== offer.background_enabled) return false
  const allowedColors = offer.premium_available ? ['black', 'white', 'wood'] : ['black', 'white']
  return allowedColors.includes(configuration.printColor) && allowedColors.includes(configuration.backgroundColor)
}
