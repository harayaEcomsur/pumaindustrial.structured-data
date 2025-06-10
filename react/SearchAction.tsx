import React from 'react'
import { Helmet } from 'vtex.render-runtime'
import { WebSite, WithContext } from 'schema-dts'
import { helmetJsonLdProp } from 'react-schemaorg'
import { getBaseUrl } from './modules/baseUrl'

interface Props {
  searchTermPath?: string
}

function SearchAction({ searchTermPath }: Props) {
  const baseUrl = getBaseUrl()
  const path = !searchTermPath ? '/' : searchTermPath
  const target = path === '/' 
    ? `{search_term_string}` 
    : `${baseUrl}${path}{search_term_string}?map=ft`

  const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Puma Safety',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target,
      // @ts-expect-error 'query-input' es una propiedad válida de SearchAction según schema.org pero no está en los tipos
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Helmet
      script={[helmetJsonLdProp<WebSite>(websiteSchema)]}
    />
  )
}

export default SearchAction
