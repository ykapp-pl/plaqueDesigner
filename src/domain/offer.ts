import { z } from 'zod'
import { isSignSizeId } from '../config/signSizes'

export const OFFER_LINK_MESSAGE = 'Aby otworzyć kreator, skorzystaj z linku w ofercie lub wiadomości e-mail dotyczącej zamówienia.'
export const offerCodeSchema = z.string().regex(/^[a-f0-9]{32}$/)
export const offerSchema = z.object({
  defaultSizeId: z.string().refine(isSignSizeId),
  allowedSizeIds: z.array(z.string().refine(isSignSizeId)).min(1),
  backgroundDefaultEnabled: z.boolean(),
  backgroundEditable: z.boolean(),
  premiumAvailable: z.boolean(),
}).superRefine((offer, context) => {
  if (!offer.allowedSizeIds.includes(offer.defaultSizeId)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['defaultSizeId'], message: 'Format domyślny musi należeć do wariantu oferty.' })
  }
})
export type Offer = z.infer<typeof offerSchema>
