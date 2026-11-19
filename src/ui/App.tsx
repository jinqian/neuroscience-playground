import { useEffect, useState } from 'react'
import { ContentProvider } from '../content/ContentProvider'
import { loadBrowserContent } from '../content/load.browser'
import type { ContentBundle, ContentError } from '../content/schema'
import { StoreLanguageProvider } from '../i18n/StoreLanguageProvider'
import { progressStore } from '../progress/store'
import { ErrorScreen } from './ErrorScreen'
import { AppRoutes } from './routes'

type Loaded = { bundle?: ContentBundle; errors: ContentError[] }

export default function App({ loaded }: { loaded?: Loaded }) {
  const [content] = useState<Loaded>(() => loaded ?? loadBrowserContent())
  useEffect(() => {
    if (content.bundle) progressStore.getState().setUnits(content.bundle.units)
  }, [content.bundle])

  if (content.errors.length || !content.bundle) return <ErrorScreen errors={content.errors} />
  return (
    <StoreLanguageProvider>
      <ContentProvider bundle={content.bundle}>
        <AppRoutes />
      </ContentProvider>
    </StoreLanguageProvider>
  )
}
