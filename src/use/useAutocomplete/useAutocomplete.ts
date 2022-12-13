import { ref } from 'vue'

export interface Options {
  queryParam: string
  requestMethod: 'GET' | 'POST'
}

const defaultOptions: Options = {
  queryParam: 'queryParam',
  requestMethod: 'GET',
}

function isValidURL(url: string) {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ) // fragment locator
  return pattern.test(url)
}

export const useAutocomplete = <T>(
  url: string,
  options: Options = defaultOptions,
) => {
  if (!isValidURL(url)) {
    throw new Error(`${url} is not a valid URL!`)
  }

  if (!options.queryParam) {
    throw new Error(`'queryParam' option is required`)
  }

  const isLoading = ref(false)
  const data = ref<T[]>([])
  const hasFailed = ref(false)

  async function doRequest(query: string): Promise<void> {
    try {
      isLoading.value = true
      hasFailed.value = false

      const _url = new URL(url)

      _url.search = new URLSearchParams({
        [options.queryParam]: query,
      }).toString()

      const response = await fetch(_url)

      data.value = await response.json()
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
    doRequest,
  }
}
