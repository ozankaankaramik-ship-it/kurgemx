import LegalLayout, { generateLegalMetadata } from '@/components/ui/LegalLayout'

export const generateMetadata = () => generateLegalMetadata('refund')

export default function RefundPage() {
  return (
    <LegalLayout
      tNamespace="refund"
      sectionCount={5}
      footerNote="İade taleplerin için support@kurgemx.com adresinden bize ulaşabilirsin. 24 saat içinde dönüş yapıyoruz."
    />
  )
}
