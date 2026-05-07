import { FileDown } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Props = {
  title?: string
}

/** WeasyPrint PDF üretimini backend tamamlayana kadar mock HTML indirimi */
export function PDFReportExporter({ title = 'WEN ESG raporu' }: Props) {
  const handleExport = () => {
    const html = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: 'Barlow', system-ui; background:#07090f; color:#f8fafc; padding:32px; }
    h1 { letter-spacing:0.4em; text-transform:uppercase; font-size:14px; color:#9ca3af; }
    section { margin-top:24px; border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:24px; }
  </style>
</head>
<body>
  <h1>WEN · Mock WeasyPrint</h1>
  <section>
    <p>Bu çıktı, PDF pipeline bağlanmadan önce tasarımcıların akışını doğrulaması için üretilir.</p>
    <p>Kapsam 3 emisyon blokları gerçek veri bağlandığında dinamikleşecek.</p>
  </section>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'wen-esg-report-mock.html'
    anchor.click()
    queueMicrotask(() => URL.revokeObjectURL(url))
  }

  return (
    <Button type="button" variant="secondary" size="lg" className="w-full md:w-max" onClick={handleExport}>
      <span className="inline-flex items-center gap-s3">
        <FileDown className="h-5 w-5" />
        İndir (mock WeasyPrint)
      </span>
    </Button>
  )
}
