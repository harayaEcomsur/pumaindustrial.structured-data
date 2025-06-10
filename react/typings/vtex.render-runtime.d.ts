declare module 'vtex.render-runtime' {
  import { ComponentType } from 'react'

  export interface HelmetProps {
    children?: React.ReactNode
    script?: Array<{
      type?: string
      [key: string]: any
    }>
  }

  export const Helmet: ComponentType<HelmetProps>
} 