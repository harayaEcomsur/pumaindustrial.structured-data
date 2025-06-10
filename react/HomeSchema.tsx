import React, { FC } from 'react'
import { Helmet } from 'vtex.render-runtime'
import useAppSettings from './hooks/useAppSettings'
import { getBaseUrl } from './modules/baseUrl'

interface Props {
  products?: Array<{
    productName: string
    linkText: string
    items: Array<{
      itemId: string
      images: Array<{ imageUrl: string }>
    }>
  }>
}

const HomeSchema: FC<Props> = () => {
  const {
    organizationName,
    organizationLogo,
    organizationUrl,
  } = useAppSettings()

  const baseUrl = getBaseUrl()

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizationName || 'Puma Safety',
    alternateName: `${organizationName || 'Puma Safety'} Chile`,
    url: organizationUrl || baseUrl,
    logo: organizationLogo || 'https://pumaindustrial.vtexassets.com/arquivos/logo-puma-negro.png',
    sameAs: []
  }

  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Puma Safety',
    url: organizationUrl || baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `{search_term_string}`,
      'query-input': 'required name=search_term_string',
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  )
}

export default HomeSchema 