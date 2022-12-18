<script lang="ts" setup>
  import { ref } from 'vue'
  import { useAutocomplete } from './use/useAutocomplete/useAutocomplete'

  interface PublicApi {
    API: string
    Description: string
    Link: string
  }

  const searchQuery = ref('')
  const selectedItem = ref<PublicApi | null>(null)
  const canShowSuggestions = ref(false)

  const { fetchSuggestions, data, isLoading } = useAutocomplete<PublicApi>(
    'https://api.publicapis.org/entries',
    {
      queryParam: 'title',
      transformData: (data: { entries: PublicApi[] }) => data.entries,
      debounceDuration: 500,
    },
  )

  function onInput() {
    if (searchQuery.value?.length > 2) {
      canShowSuggestions.value = true
      fetchSuggestions(searchQuery.value)
    } else {
      data.value = []
      selectedItem.value = null
    }
  }

  function onItemClick(item: PublicApi) {
    selectedItem.value = item
    canShowSuggestions.value = false
    searchQuery.value = item.API
  }
</script>

<template>
  <div :class="$style.wrapper">
    <div :class="$style.content">
      <h1 :class="$style.headline">Search for a public APIs</h1>
      <input
        type="text"
        :class="$style.input"
        placeholder="search..."
        v-model="searchQuery"
        @input="onInput"
      />

      <ul
        :class="$style.list"
        v-if="canShowSuggestions"
      >
        <strong
          v-if="isLoading"
          :class="$style.loader"
          >Loading...</strong
        >

        <li
          v-for="(item, index) in data"
          :key="index"
        >
          <button
            :class="$style.item"
            @click="onItemClick(item)"
          >
            {{ item.API }}
          </button>
        </li>
      </ul>

      <div
        v-if="selectedItem"
        :class="$style.card"
      >
        <p>
          <strong>{{ selectedItem.API }}</strong>
        </p>

        <p>{{ selectedItem.Description }}</p>

        <p>{{ selectedItem.Link }}</p>
      </div>
    </div>
  </div>
</template>

<style module>
  .wrapper {
    font-family: 'Courier New', Courier, monospace;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
  }

  .content {
    width: 500px;
    display: flex;
    flex-direction: column;
  }

  .headline {
    text-align: center;
  }

  .input {
    padding: 10px;
    border: 1px solid lightgray;
  }

  .list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .loader {
    margin-top: 10px;
  }

  .item {
    border: 1px solid lightgray;
    padding: 10px;
    cursor: pointer;
    width: 100%;
    background-color: #fff;
    margin-top: 10px;
  }

  .card {
    margin-top: 10px;
    padding: 20px;
    border: 1px solid lightgray;
    word-wrap: break-word;
  }
</style>
