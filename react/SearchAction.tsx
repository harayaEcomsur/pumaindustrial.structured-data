import React from 'react'
import { Helmet } from 'react-helmet'
import { WebSite } from 'schema-dts'
import { helmetJsonLdProp } from 'react-schemaorg'

import { getBaseUrl } from './modules/baseUrl'

interface Props {
  searchTermPath?: string
}

function SearchAction({ searchTermPath }: Props) {
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
            target: path === '/' ? `{search_term_string}` : `${baseUrl}${path}{search_term_string}?map=ft`,
            // @ts-expect-error it's a valid property
            'query-input': 'required name=search_term_string',
          },
        }),
      ]}
    />
  )
}

export default SearchAction
