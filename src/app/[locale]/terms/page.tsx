import LegalLayout, { generateLegalMetadata } from '@/components/ui/LegalLayout'

export const generateMetadata = () => generateLegalMetadata('terms')

export default function TermsPage() {
  return <LegalLayout tNamespace="terms" sectionCount={5} />
}
