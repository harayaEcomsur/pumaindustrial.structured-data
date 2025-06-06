import React, { memo } from 'react'
import { useRuntime } from 'vtex.render-runtime'
import { jsonLdScriptProps } from 'react-schemaorg'
import { Helmet } from 'react-helmet'
import { pathOr, path, sort, last, flatten } from 'ramda'
import { ProductData, ParseToJsonLDParams, StructuredDataProps, Product, SelectedItem, Offer, AggregateOffer, Seller } from './typings/schema'
import useAppSettings from './hooks/useAppSettings'
import { getBaseUrl } from './modules/baseUrl'

const getSpotPrice = (seller: Seller) => path(['commertialOffer', 'spotPrice'])(seller) as number
const getPrice = (seller: Seller) => path(['commertialOffer', 'Price'])(seller) as number
const getTax = (seller: Seller) => path(['commertialOffer', 'Tax'])(seller) as number
const getAvailableQuantity = (seller: Seller) => pathOr(0, ['commertialOffer', 'AvailableQuantity'])(seller) as number

const getFinalPrice = (value: Seller, getPriceFunc: (seller: Seller) => number, { decimals, pricesWithTax }: { decimals: number; pricesWithTax: boolean }) => {
  return pricesWithTax
    ? Math.round(
        (getPriceFunc(value) + getTax(value) + Number.EPSILON) * 10 ** decimals
      ) /
        10 ** decimals
    : getPriceFunc(value)
}

const sortByPriceAsc = sort(
  (itemA: Seller, itemB: Seller) => getSpotPrice(itemA) - getSpotPrice(itemB)
)

const sortByPriceWithTaxAsc = sort(
  (itemA: Seller, itemB: Seller) =>
    getSpotPrice(itemA) + getTax(itemA) - (getSpotPrice(itemB) + getTax(itemB))
)

const isSkuAvailable = (sku: Seller) => getAvailableQuantity(sku) > 0

const lowHighForSellers = (sellers: Seller[], { pricesWithTax }: { pricesWithTax: boolean }) => {
  const sortedByPrice = pricesWithTax
    ? sortByPriceWithTaxAsc(sellers)
    : sortByPriceAsc(sellers)

  const withStock = sortedByPrice.filter(isSkuAvailable)

  if (withStock.length === 0) {
    return {
      low: sortedByPrice[0],
      high: last(sortedByPrice),
    }
  }

  return {
    low: withStock[0],
    high: last(withStock),
  }
}

const IN_STOCK = 'http://schema.org/InStock'
const OUT_OF_STOCK = 'http://schema.org/OutOfStock'

const getSKUAvailabilityString = (seller: Seller) =>
  isSkuAvailable(seller) ? IN_STOCK : OUT_OF_STOCK

const formatGTIN = (gtin: string | null) => {
  if (!gtin || typeof gtin !== 'string') return null

  const validLengths = [8, 12, 13, 14]
  if (validLengths.includes(gtin.length)) return gtin

  const targetLength = validLengths.find((len) => gtin.length < len) || 14
  return gtin.padStart(targetLength, '0')
}

const parseSKUToOffer = (
  item: SelectedItem,
  currency: string,
  { decimals, pricesWithTax, useSellerDefault }: { decimals: number; pricesWithTax: boolean; useSellerDefault: boolean }
): Offer | null => {
  const defaultSeller = getSellerDefault(item.sellers)
  const seller = useSellerDefault && defaultSeller
    ? defaultSeller
    : lowHighForSellers(item.sellers, { pricesWithTax }).low

  if (!seller) {
    return null
  }

  const availability = getSKUAvailabilityString(seller)

  const price = getFinalPrice(seller, getSpotPrice, { decimals, pricesWithTax })

  if (availability === OUT_OF_STOCK && price === 0) {
    return null
  }

  const offer: Offer = {
    '@type': 'Offer',
    price,
    priceCurrency: currency,
    availability: getSKUAvailabilityString(seller),
    sku: item.itemId,
    itemCondition: 'http://schema.org/NewCondition',
    priceValidUntil: path(['commertialOffer', 'PriceValidUntil'], seller),
    seller: {
      '@type': 'Organization',
      name: seller.sellerName,
    },
  }

  return offer
}

const getAllSellers = (items: SelectedItem[]): Seller[] => {
  const allSellers = items.map((item) => item.sellers)
  return flatten(allSellers) as unknown as Seller[]
}

const getSellerDefault = (sellers: Seller[]): Seller | undefined => {
  return sellers.find((s) => s.sellerDefault)
}

const composeAggregateOffer = (
  product: Product,
  currency: string,
  { decimals, pricesWithTax, useSellerDefault, disableAggregateOffer }: { 
    decimals: number; 
    pricesWithTax: boolean; 
    useSellerDefault: boolean; 
    disableAggregateOffer: boolean 
  }
): AggregateOffer | Offer[] | null => {
  const items = product.items || []
  const allSellers = getAllSellers(items)
  const { low, high } = lowHighForSellers(allSellers, { pricesWithTax })

  if (!low || !high) {
    return null
  }

  const offersList = items
    .map((element: SelectedItem) =>
      parseSKUToOffer(element, currency, {
        decimals,
        pricesWithTax,
        useSellerDefault,
      })
    )
    .filter((offer: Offer | null): offer is Offer => offer !== null)

  if (offersList.length === 0) {
    return null
  }

  if (disableAggregateOffer) {
    return offersList
  }

  const aggregateOffer: AggregateOffer = {
    '@type': 'AggregateOffer',
    lowPrice: getFinalPrice(low, getSpotPrice, { decimals, pricesWithTax }),
    highPrice: getFinalPrice(high, getPrice, { decimals, pricesWithTax }),
    priceCurrency: currency,
    offers: offersList,
    offerCount: items.length,
  }

  return aggregateOffer
}

const getCategoryName = (product: Product) =>
  product.categoryTree &&
  product.categoryTree.length > 0 &&
  product.categoryTree[product.categoryTree.length - 1].name

function parseBrand(brand: string | { name: string }) {
  return {
    '@type': 'Brand' as const,
    name: typeof brand === 'string' ? brand : brand.name,
  }
}

export const parseToJsonLD = ({
  product,
  selectedItem,
  currency,
  disableOffers,
  decimals,
  pricesWithTax,
  useSellerDefault,
  useImagesArray,
  disableAggregateOffer,
  gtinValue,
}: ParseToJsonLDParams): ProductData | null => {
  if (!product || !selectedItem) {
    return null
  }

  const images = selectedItem.images || []
  const { brand } = product
  const name = product.productName

  if (!name || !brand) {
    return null
  }

  const mpn =
    selectedItem?.referenceId?.[0]?.Value ||
    product?.productReference ||
    product?.productId ||
    ''

  const offers = composeAggregateOffer(product, currency, {
    decimals,
    pricesWithTax,
    useSellerDefault,
    disableAggregateOffer,
  })

  if (offers === null) {
    return null
  }

  const baseUrl = getBaseUrl()

  const category = getCategoryName(product)

  const rawGTIN = selectedItem?.[gtinValue || ''] || null
  const gtin = formatGTIN(rawGTIN)

  const productUrl = `${baseUrl}/${product.linkText}/p`

  const productLD: ProductData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': productUrl,
    name,
    brand: parseBrand(brand),
    image: useImagesArray
      ? images.map((el: { imageUrl: string }) => el.imageUrl)
      : images[0]?.imageUrl || null,
    description: product.metaTagDescription || product.description || '',
    mpn,
    sku: selectedItem?.itemId || null,
    category: category || null,
    offers: disableOffers ? null : offers,
    gtin,
    url: productUrl,
  }

  return productLD
}

function StructuredData({ product, selectedItem }: StructuredDataProps) {
  const {
    culture: { currency },
  } = useRuntime()

  const {
    decimals,
    disableOffers,
    pricesWithTax,
    useSellerDefault,
    useImagesArray,
    disableAggregateOffer,
    gtinValue,
  } = useAppSettings()

  const productLD = parseToJsonLD({
    product,
    selectedItem,
    currency,
    disableOffers,
    decimals,
    pricesWithTax,
    useSellerDefault,
    useImagesArray,
    disableAggregateOffer,
    gtinValue,
  })

  if (!productLD) {
    return null
  }

  // Asegurarnos de que el JSON-LD sea válido
  const jsonLD = JSON.stringify(productLD)

  return (
    <Helmet>
      <script type="application/ld+json">
        {jsonLD}
      </script>
    </Helmet>
  )
}

export default memo(StructuredData) 