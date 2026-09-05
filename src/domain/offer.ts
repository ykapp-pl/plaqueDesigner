import { z } from 'zod'
import { isSignSizeId } from '../config/signSizes'

export const OFFER_LINK_MESSAGE = 'Aby otworzyć kreator, skorzystaj z linku w ofercie lub wiadomości e-mail dotyczącej zamówienia.'
export const offerCodeSchema = z.string().regex(/^[a-f0-9]{32}$/)
export const offerSchema = z.object({
  sizeId: z.string().refine(isSignSizeId),
  backgroundEnabled: z.boolean(),
  premiumAvailable: z.boolean(),
})
export type Offer = z.infer<typeof offerSchema>
