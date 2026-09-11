import type { PlanDetay } from '@/lib/abonelik'

export const WATERMARK_TEXT = 'Bu doküman KurgemX ile üretildi → kurgemx.com'

export function shouldApplyWatermark(plan: Pick<PlanDetay, 'kod'>): boolean {
  return plan.kod === 'freemium'
}
