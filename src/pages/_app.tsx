import HeadConfig, { HeadConfigProps } from '@/components/HeadConfig'
import Navbar from '@/components/navbar/Navbar'
import { initAllStores } from '@/stores/utils'
import '@/styles/globals.css'
import { cx } from '@/utils/className'
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import { Source_Sans_Pro } from 'next/font/google'
import { useEffect, useState } from 'react'

const sourceSansPro = Source_Sans_Pro({
  weight: ['400', '600'],
  subsets: ['latin'],
})

export type AppCommonProps = {
  head?: HeadConfigProps
  dehydratedState?: any
}

export default function App({
  Component,
  pageProps,
}: AppProps<AppCommonProps>) {
  const [client] = useState(() => new QueryClient())
  const { head, dehydratedState } = pageProps

  useEffect(() => {
    initAllStores()
  }, [])

  return (
    <QueryClientProvider client={client}>
      <Hydrate state={dehydratedState}>
        <HeadConfig {...head} />
        <div
          className={cx(
            'flex h-screen flex-col bg-background text-text',
            sourceSansPro.className
          )}
        >
          <Navbar />
          <Component />
        </div>
      </Hydrate>
    </QueryClientProvider>
  )
}
