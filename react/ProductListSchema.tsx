import React, { FC } from 'react'
import { Helmet } from 'vtex.render-runtime'
import { useSearchPage } from 'vtex.search-page-context/SearchPageContext'
import useAppSettings from './hooks/useAppSettings'
import { getProductList } from './ProductList'

const ProductListSchema: FC = () => {
  const searchPage = useSearchPage()
  
  console.log('ProductListSchema mounted')
  console.log('SearchPage:', searchPage)
  console.log('SearchQuery:', searchPage?.searchQuery)

  // Obtenemos los productos de searchQuery.data.products
  const products = searchPage?.searchQuery?.data?.products || []

  console.log('Extracted products:', products)

  if (!products || products.length === 0) {
    console.log('No products found')
    return null
  }

  const { disableOffers, decimals, pricesWithTax } = useAppSettings()
  const productListLD = getProductList({
    disableOffers,
    decimals,
    pricesWithTax,
    currency: 'CLP', // Valor por defecto para Chile
    products,
  })

  if (!productListLD) {
    console.log('No productListLD generated')
    return null
  }

  return (
    <Helmet>
      <script type="application/ld+json" id="product-list-schema">
        {JSON.stringify(productListLD)}
      </script>
    </Helmet>
  )
}

export default ProductListSchema 