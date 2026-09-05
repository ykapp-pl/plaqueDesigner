import { SIGN_COLOR_IDS } from '../config/signColors'
import { z } from 'zod'

import { getSignSizeById, isSignSizeId } from '../config/signSizes'
import { FONT_SIZE_LIMITS } from './signProject'

const nonEmptyText = (maxLength: number) => z.string().trim().min(1).max(maxLength)

export const orderMetadataSchema = z.object({
  login: nonEmptyText(80),
  orderNumber: nonEmptyText(80),
})

export const projectLookupSchema = z.object({
  id: z.string().uuid(),
  accessToken: z.string().uuid(),
})

export const signLineSchema = z.object({
  id: nonEmptyText(80),
  text: z.string().max(200),
  areaHeightMm: z.number().finite().nonnegative().default(0),
  fontFamily: nonEmptyText(120),
  offsetXMm: z.number().finite().default(0),
  offsetYMm: z.number().finite().default(0),
  fontSizeMm: z.number().min(FONT_SIZE_LIMITS.min).max(FONT_SIZE_LIMITS.max),
  horizontalAlign: z.enum(['left', 'center', 'right']),
  verticalAlign: z.enum(['top', 'center', 'bottom']),
})

export const signProjectConfigurationSchema = z
  .object({
    schemaVersion: z.literal(1),
    sizeId: z.string().refine(isSignSizeId, 'Niepoprawny format tabliczki.'),
    widthMm: z.number().positive(),
    heightMm: z.number().positive(),
    lineCount: z.number().int().positive(),
    lines: z.array(signLineSchema),
    backgroundColor: z.enum(SIGN_COLOR_IDS).default('black'),
    printColor: z.enum(SIGN_COLOR_IDS).default('white'),
    backgroundEnabled: z.boolean(),
    dividersEnabled: z.boolean().default(false),
    mountingHolesEnabled: z.boolean(),
  })
  .superRefine((configuration, context) => {
    const size = getSignSizeById(configuration.sizeId)
    if (!size) return

    if (configuration.widthMm !== size.widthMm || configuration.heightMm !== size.heightMm) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['widthMm'],
        message: 'Wymiary muszą odpowiadać wybranemu formatowi.',
      })
    }

    if (!size.allowedLineCounts.includes(configuration.lineCount)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lineCount'],
        message: 'Wybrana liczba obszarów nie jest dostępna dla tego formatu.',
      })
    }

    if (configuration.lines.length !== configuration.lineCount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lines'],
        message: 'Liczba konfiguracji obszarów musi odpowiadać lineCount.',
      })
    }
  })

export const draftProjectSchema = z.object({
  id: z.string().uuid().optional(),
  accessToken: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  customer: z.object({
    login: z.string().max(80),
    orderNumber: z.string().max(80),
  }),
  configuration: signProjectConfigurationSchema,
})

export const signProjectSchema = z
  .object({
    id: z.string().uuid().optional(),
    accessToken: z.string().uuid().optional(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
    customer: orderMetadataSchema,
    configuration: signProjectConfigurationSchema,
  })
  .superRefine((project, context) => {
    project.configuration.lines.forEach((line, index) => {
      if (!line.text.trim()) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['configuration', 'lines', index, 'text'],
          message: 'Wpisz tekst tego obszaru.',
        })
      }
    })
  })

export type ValidatedOrderMetadata = z.infer<typeof orderMetadataSchema>
export type ValidatedSignProjectConfiguration = z.infer<typeof signProjectConfigurationSchema>
