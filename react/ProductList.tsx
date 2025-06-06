import React, { Suspense } from 'react'
import { jsonLdScriptProps } from 'react-schemaorg'
import { ItemList, WithContext, ListItem } from 'schema-dts'
import { useRuntime } from 'vtex.render-runtime'
import { Product } from './typings/schema'
import useAppSettings from './hooks/useAppSettings'
import { parseToJsonLD } from './Product'

interface Props {
  products?: Product[]
}

export function getProductList({
  disableOffers,
  decimals,
  pricesWithTax,
  currency,
  products,
}: {
  disableOffers: boolean
  decimals: number
  pricesWithTax: boolean
  currency: string
  products?: Product[]
}) {
  if (!Array.isArray(products)) {
    return null
  }

  const productItems: ListItem[] = products.map((product, index) => {
    const [selectedItem] = product.items || []
    if (!selectedItem) {
      return {
        '@type': 'ListItem',
        position: index + 1,
      }
    }

    const item = parseToJsonLD({
      product,
      selectedItem,
      currency,
      disableOffers,
      decimals,
      pricesWithTax,
      useSellerDefault: false,
      useImagesArray: false,
      disableAggregateOffer: false,
    })

    return {
      '@type': 'ListItem',
      position: index + 1,
      ...(item && { item }),
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: productItems,
  } as WithContext<ItemList>
}

// Componente que maneja el schema
const ProductListContent: React.FC<Props> = ({ products }) => {
  const {
    culture: { currency },
  } = useRuntime()

  const { disableOffers, decimals, pricesWithTax } = useAppSettings()
  const productListLD: WithContext<ItemList> | null = getProductList({
    disableOffers,
    decimals,
    pricesWithTax,
    currency,
    products,
  })

  if (!productListLD) {
    return null
  }

  return <script {...jsonLdScriptProps<ItemList>(productListLD)} />
}

// Componente principal con Suspense
function ProductList(props: Props) {
  return (
    <Suspense fallback={null}>
      <ProductListContent {...props} />
    </Suspense>
  )
}

export default ProductList
