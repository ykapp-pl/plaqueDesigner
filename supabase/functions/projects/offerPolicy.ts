export function isOfferCode(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{32}$/.test(value)
}

export interface OfferPolicy {
  size_id: string
  allowed_size_ids: string[]
  background_enabled: boolean
  background_editable: boolean
  premium_available: boolean
}

export function matchesOffer(configuration: any, offer: OfferPolicy): boolean {
  if (!configuration || !offer.allowed_size_ids.includes(configuration.sizeId) ||
      (!offer.background_editable && configuration.backgroundEnabled !== offer.background_enabled)) return false
  const allowedColors = offer.premium_available ? ['black', 'white', 'wood'] : ['black', 'white']
  return allowedColors.includes(configuration.printColor) && allowedColors.includes(configuration.backgroundColor)
}
