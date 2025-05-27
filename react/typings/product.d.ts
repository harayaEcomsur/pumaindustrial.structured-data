import { Thing, Product as SchemaProduct } from 'schema-dts'

export interface ProductData extends SchemaProduct {
  '@context': 'https://schema.org/'
  '@type': 'Product'
  '@id': string
  name: string
  brand: {
    '@type': 'Brand'
    name: string
  }
  image: string[] | string | null
  description: string
  mpn: string
  sku: string | null
  category: string | null
  offers: AggregateOffer | Offer[] | null
  gtin: string | null
}

export interface AggregateOffer {
  '@type': 'AggregateOffer'
  lowPrice: number
  highPrice: number
  priceCurrency: string
  offers: Offer[]
  offerCount: number
}

export interface Offer {
  '@type': 'Offer'
  price: number
  priceCurrency: string
  availability: string
  sku: string
  itemCondition: string
  priceValidUntil?: string
  seller: {
    '@type': 'Organization'
    name: string
  }
}

export interface Product {
  productName: string
  brand: string | { name: string }
  metaTagDescription?: string
  description?: string
  productReference?: string
  productId?: string
  linkText: string
  categoryTree?: Array<{
    name: string
  }>
  items?: SelectedItem[]
}

export interface SelectedItem {
  itemId: string
  referenceId?: Array<{
    Value: string
  }>
  images: Array<{
    imageUrl: string
  }>
  sellers: Array<{
    sellerDefault?: boolean
    sellerName: string
    commertialOffer: {
      spotPrice: number
      Price: number
      Tax: number
      AvailableQuantity: number
      PriceValidUntil?: string
    }
  }>
  [key: string]: any
}

export interface ParseToJsonLDParams {
  product: Product
  selectedItem: SelectedItem
  currency: string
  disableOffers: boolean
  decimals: number
  pricesWithTax: boolean
  useSellerDefault: boolean
  useImagesArray: boolean
  disableAggregateOffer: boolean
  gtinValue?: string
}

export interface StructuredDataProps {
  product: Product
  selectedItem: SelectedItem
}

export interface Seller {
  sellerDefault?: boolean
  sellerName: string
  commertialOffer: {
    spotPrice: number
    Price: number
    Tax: number
    AvailableQuantity: number
    PriceValidUntil?: string
  }
} 