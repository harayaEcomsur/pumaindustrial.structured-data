import React, { FC, Suspense } from 'react'
import { Helmet } from 'react-helmet'
import { BreadcrumbList } from 'schema-dts'
import { helmetJsonLdProp } from 'react-schemaorg'

import { getBaseUrl } from './modules/baseUrl'

interface Props {
  breadcrumb?: Array<{
    name: string
    href: string
  }>
}

const getSearchBreadcrumb = (breadcrumb?: Props['breadcrumb']) => {
  if (!Array.isArray(breadcrumb) || breadcrumb?.length === 0) {
    return {}
  }

  const baseUrl = getBaseUrl()

  return helmetJsonLdProp<BreadcrumbList>({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumb.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: baseUrl + item.href,
    })),
  })
}

// Componente que maneja el schema
const SearchBreadcrumbContent: FC<Props> = ({ breadcrumb }) => {
  const breadcrumbLD = getSearchBreadcrumb(breadcrumb)

  return <Helmet script={[breadcrumbLD]} />
}

// Componente principal con Suspense
const SearchBreadcrumbStructuredData: FC<Props> = (props) => {
  return (
    <Suspense fallback={null}>
      <SearchBreadcrumbContent {...props} />
    </Suspense>
  )
}

export default SearchBreadcrumbStructuredData
