/* eslint-disable react/jsx-filename-extension */
import React from 'react'

export const useRuntime = () => {
  return {
    account: 'vtex',
    getSettings: () => ({
      storeName: 'Store Name',
      titleTag: 'Store TitleTag',
    }),
    culture: { currency: 'BRL', locale: 'pt-BR' },
  }
}

export const Helmet = ({ children, script }) => {
  if (script) {
    return (
      <div>
        {script.map((s, i) => (
          <script key={i} {...s} />
        ))}
      </div>
    )
  }
  return <div>{children}</div>
}
