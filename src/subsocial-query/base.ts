import {
  MutationFunction,
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQueries,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { QueryConfig } from './types'

export function queryWrapper<ReturnValue, Data, AdditionalData>(
  func: (queryData: { data: Data } & AdditionalData) => Promise<ReturnValue>,
  getAdditionalData: () => Promise<AdditionalData>
) {
  return async ({ queryKey }: { queryKey: any }) => {
    const data = queryKey[1]
    const additionalData = await getAdditionalData()
    return func({ ...additionalData, data })
  }
}

export function useIsAnyQueriesLoading(results: UseQueryResult[]) {
  return useMemo(() => {
    return results.some(({ isLoading }) => isLoading)
  }, [results])
}

export function mergeQueryConfig<T, V>(
  config?: QueryConfig<any, any>,
  defaultConfig?: QueryConfig<T, V>
): QueryConfig<T, V> {
  return {
    ...defaultConfig,
    ...config,
    enabled: (defaultConfig?.enabled ?? true) && (config?.enabled ?? true),
  }
}

export function createQueryKeys<Data>(key: string) {
  return (data: Data) => {
    return [key, data]
  }
}

export function createQueryInvalidation<Data>(key: string) {
  return (client: QueryClient, data: Data | null = null, exact = false) => {
    client.invalidateQueries({
      queryKey: [key, data],
      exact,
    })
  }
}

export function makeCombinedCallback(
  defaultConfig: any,
  config: any,
  attr: string
) {
  return (...data: any[]) => {
    defaultConfig && defaultConfig[attr] && defaultConfig[attr](...data)
    config && config[attr] && config[attr](...data)
  }
}

export default function mutationWrapper<ReturnValue, Data>(
  func: MutationFunction<ReturnValue, Data>,
  defaultConfig?: UseMutationOptions<ReturnValue, unknown, Data, unknown>
) {
  return function (
    config?: UseMutationOptions<ReturnValue, unknown, Data, unknown>
  ) {
    return useMutation(func, {
      ...(defaultConfig || {}),
      ...config,
      onSuccess: makeCombinedCallback(defaultConfig, config, 'onSuccess'),
      onError: makeCombinedCallback(defaultConfig, config, 'onError'),
    })
  }
}

export function createQuery<Data, ReturnValue>({
  key,
  fetcher,
}: {
  key: string
  fetcher: (data: Data) => Promise<ReturnValue>
}) {
  const getQueryKey = createQueryKeys<Data>(key)
  return {
    getQueryKey,
    invalidate: createQueryInvalidation<Data>(key),
    useQuery: (
      data: Data | null,
      config?: QueryConfig<ReturnValue, Data>,
      defaultConfig?: QueryConfig<ReturnValue, Data>
    ) => {
      const mergedConfig = mergeQueryConfig(config, defaultConfig)
      return useQuery(
        [key, data],
        queryWrapper<ReturnValue, Data, void>(
          ({ data }) => fetcher(data),
          async () => undefined
        ),
        mergedConfig
      )
    },
    useQueries: (
      data: (Data | null)[],
      config?: QueryConfig<ReturnValue, Data>,
      defaultConfig?: QueryConfig<ReturnValue, Data>
    ) => {
      const mergedConfig = mergeQueryConfig(config, defaultConfig)
      return useQueries({
        queries: data.map((singleData) => {
          return {
            queryKey: [key, singleData],
            queryFn: queryWrapper<ReturnValue, Data, void>(
              ({ data }) => fetcher(data),
              async () => undefined
            ),
            ...mergedConfig,
          }
        }),
      })
    },
    setQueryData: (client: QueryClient, data: Data, value: ReturnValue) => {
      client.setQueryData(getQueryKey(data), value ?? null)
    },
    fetchQuery: async (client: QueryClient, data: Data) => {
      const res = await fetcher(data)
      client.setQueryData(getQueryKey(data), res ?? null)
      return res
    },
  }
}
