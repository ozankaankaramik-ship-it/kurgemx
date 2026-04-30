import fs from 'fs'
import path from 'path'

function oku(dosyaAdi: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'standartlar', dosyaAdi), 'utf-8')
}

export const genel = oku('genel.md')
export const hikayeHaritasi = oku('hikaye_haritasi.md')
export const isAnalizi = oku('is_analizi.md')
export const testSenaryosu = oku('test_senaryosu.md')
export const mimari = oku('mimari.md')
