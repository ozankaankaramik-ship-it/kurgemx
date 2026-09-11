import type { PlanDetay } from '@/lib/abonelik'

export const WATERMARK_TEXT = 'Bu doküman KurgemX ile üretildi → kurgemx.com'

export function shouldApplyWatermark(plan: Pick<PlanDetay, 'kod'>): boolean {
  return plan.kod === 'freemium'
}

// Prototip (.html) export'una enjekte edilen sabit alt bant — <body>'nin doğrudan
// çocuğu olarak eklenmeli ki .screen div'leri arasında geçişten etkilenmeden
// (position:fixed) her ekranda görünür kalsın.
export function watermarkBannerHtml(): string {
  return `<div id="kurgemx-watermark" style="position:fixed;bottom:0;left:0;right:0;z-index:2147483647;background:rgba(31,56,100,.94);color:#fff;font:italic 11px/1.4 Arial,Helvetica,sans-serif;text-align:center;padding:6px 12px;box-sizing:border-box;pointer-events:none;">Bu doküman KurgemX ile üretildi → <a href="https://kurgemx.com" target="_blank" rel="noopener" style="color:#fff;text-decoration:underline;pointer-events:auto;">kurgemx.com</a></div>`
}
