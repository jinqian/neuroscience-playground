import { createContext, useContext, type ReactNode } from 'react'
import type { ContentBundle } from './schema'

const ContentContext = createContext<ContentBundle | null>(null)

export function ContentProvider({ bundle, children }: { bundle: ContentBundle; children: ReactNode }) {
  return <ContentContext.Provider value={bundle}>{children}</ContentContext.Provider>
}

export function useContent(): ContentBundle {
  const c = useContext(ContentContext)
  if (!c) throw new Error('useContent must be used inside <ContentProvider>')
  return c
}
