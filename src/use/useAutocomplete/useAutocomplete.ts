import { ref } from 'vue'

export interface Options {
  queryParam: string
  transformData?: (data: any) => any
  debounceDuration?: number
}

const DEFAULT_DEBOUNCE_DURATION_IN_MILLIS = 1_000

function isValidURL(url: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$',
    'i',
  )

  return pattern.test(url)
}

function debounce(callback: (...args: any[]) => any, wait: number) {
  let timeoutId: number | null = null

  return (...args: any[]) => {
    window.clearTimeout(timeoutId!)

    timeoutId = window.setTimeout(() => {
      callback.apply(null, args)
    }, wait)
  }
}

export function useAutocomplete<T>(
  url: string,
  {
    queryParam,
    transformData = (data) => data,
    debounceDuration = DEFAULT_DEBOUNCE_DURATION_IN_MILLIS,
  }: Options,
) {
  if (!isValidURL(url)) {
    throw new Error(`${url} is not a valid URL!`)
  }

  if (!queryParam) {
    throw new Error(`'queryParam' option is required`)
  }

  const isLoading = ref(false)
  const data = ref<T[]>([])
  const hasFailed = ref(false)

  async function fetchSuggestions(query: string): Promise<void> {
    try {
      isLoading.value = true
      hasFailed.value = false

      const _url = new URL(url)

      _url.search = new URLSearchParams({
        [queryParam]: query,
      }).toString()

      const response = await fetch(_url)
      const responseJson = await response.json()

      data.value = transformData(responseJson)
    } catch (error) {
      hasFailed.value = true
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    hasFailed,
    data,
    fetchSuggestions: debounce(fetchSuggestions, debounceDuration),
  }
}
