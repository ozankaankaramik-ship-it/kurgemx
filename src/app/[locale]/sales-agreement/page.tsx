import LegalLayout, { generateLegalMetadata } from '@/components/ui/LegalLayout'

export const generateMetadata = () => generateLegalMetadata('salesAgreement')

export default function SalesAgreementPage() {
  return <LegalLayout tNamespace="salesAgreement" sectionCount={7} withSatici />
}
