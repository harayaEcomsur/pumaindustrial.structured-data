import { useQuery } from 'react-apollo'

import GET_SETTINGS from '../queries/getSettings.graphql'

const DEFAULT_DISABLE_OFFERS = false
const DEFAULT_DECIMALS = 2
const DEFAULT_PRICES_WITH_TAX = false
const DEFAULT_USE_SELLER_DEFAULT = false
const DEFAULT_USE_IMAGES_ARRAY = false
const DEFAULT_DISABLE_AGGREGATE_OFFER = false
const DEFAULT_GTIN_VALUE = 'ean'
const DEFAULT_ORGANIZATION_NAME = ''
const DEFAULT_ORGANIZATION_LOGO = ''
const DEFAULT_ORGANIZATION_URL = ''
const DEFAULT_ORGANIZATION_DESCRIPTION = ''

interface Settings {
  disableOffers: boolean
  decimals: number
  pricesWithTax: boolean
  useSellerDefault: boolean
  useImagesArray: boolean
  disableAggregateOffer: boolean
  gtinValue?: string
  organizationName: string
  organizationLogo: string
  organizationUrl: string
  organizationDescription: string
}

const useAppSettings = (): Settings => {
  const { data } = useQuery(GET_SETTINGS, { ssr: true })

  if (data?.publicSettingsForApp?.message) {
    const {
      decimals,
      disableOffers,
      pricesWithTax,
      useSellerDefault,
      useImagesArray,
      disableAggregateOffer,
      gtinValue,
      organizationName,
      organizationLogo,
      organizationUrl,
      organizationDescription
    } = JSON.parse(data.publicSettingsForApp.message)

    return {
      disableOffers: disableOffers || DEFAULT_DISABLE_OFFERS,
      decimals: decimals || DEFAULT_DECIMALS,
      pricesWithTax: pricesWithTax || DEFAULT_PRICES_WITH_TAX,
      useSellerDefault: useSellerDefault || DEFAULT_USE_SELLER_DEFAULT,
      useImagesArray: useImagesArray || DEFAULT_USE_IMAGES_ARRAY,
      disableAggregateOffer:
        disableAggregateOffer || DEFAULT_DISABLE_AGGREGATE_OFFER,
      gtinValue: gtinValue || DEFAULT_GTIN_VALUE,
      organizationName: organizationName || DEFAULT_ORGANIZATION_NAME,
      organizationLogo: organizationLogo || DEFAULT_ORGANIZATION_LOGO,
      organizationUrl: organizationUrl || DEFAULT_ORGANIZATION_URL,
      organizationDescription: organizationDescription || DEFAULT_ORGANIZATION_DESCRIPTION
    }
  }

  return {
    disableOffers: DEFAULT_DISABLE_OFFERS,
    decimals: DEFAULT_DECIMALS,
    pricesWithTax: DEFAULT_PRICES_WITH_TAX,
    useSellerDefault: DEFAULT_USE_SELLER_DEFAULT,
    useImagesArray: DEFAULT_USE_IMAGES_ARRAY,
    disableAggregateOffer: DEFAULT_DISABLE_AGGREGATE_OFFER,
    gtinValue: DEFAULT_GTIN_VALUE,
    organizationName: DEFAULT_ORGANIZATION_NAME,
    organizationLogo: DEFAULT_ORGANIZATION_LOGO,
    organizationUrl: DEFAULT_ORGANIZATION_URL,
    organizationDescription: DEFAULT_ORGANIZATION_DESCRIPTION
  }
}

export default useAppSettings
