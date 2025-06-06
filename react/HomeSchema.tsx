import React, { FC, Suspense } from 'react'
import { Helmet } from 'react-helmet'
import { jsonLdScriptProps } from 'react-schemaorg'
import { WebSite, WithContext, SearchAction } from 'schema-dts'
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

// Componente que maneja el schema
const SchemaContent: FC = () => {
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
  const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Puma Safety',
    url: organizationUrl || baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `{search_term_string}`,
      queryInput: 'required name=search_term_string',
    } as SearchAction,
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script {...jsonLdScriptProps<WebSite>(websiteSchema)} />
    </Helmet>
  )
}

// Componente principal con Suspense
const HomeSchema: FC<Props> = () => {
  return (
    <Suspense fallback={null}>
      <SchemaContent />
    </Suspense>
  )
}

export default HomeSchema 