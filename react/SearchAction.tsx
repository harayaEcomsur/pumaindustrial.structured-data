import React, { Suspense } from 'react'
import { Helmet } from 'react-helmet'
import { WebSite } from 'schema-dts'
import { helmetJsonLdProp } from 'react-schemaorg'

import { getBaseUrl } from './modules/baseUrl'

interface Props {
  searchTermPath?: string
}

// Componente que maneja el schema
const SearchActionContent: React.FC<Props> = ({ searchTermPath }) => {
  const baseUrl = getBaseUrl()
  const path = !searchTermPath ? '/' : searchTermPath

  return (
    <Helmet
      script={[
        helmetJsonLdProp<WebSite>({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Puma Safety',
          url: baseUrl,
          potentialAction: {
            '@type': 'SearchAction',
            target: `{search_term_string}`,
            // @ts-expect-error it's a valid property
            'query-input': 'required name=search_term_string',
          }
        }),
      ]}
    />
  )
}

// Componente principal con Suspense
function SearchAction(props: Props) {
  return (
    <Suspense fallback={null}>
      <SearchActionContent {...props} />
    </Suspense>
  )
}

export default SearchAction
