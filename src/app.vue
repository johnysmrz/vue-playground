<template>
  <div id="app">
    <!-- <TestForm :config="config"></TestForm> -->
    <!-- <CzSorter></CzSorter> -->
    <!-- <Calendar></Calendar> -->
    <SettingsEditor></SettingsEditor>
  </div>
</template>

<script>
import TestForm from './components/test-form'
import CzSorter from './components/cz-sorter'
import BootstrapCss from 'bootstrap-css-only'
import Calendar from './components/calendar'
import SettingsEditor from './components/settings-editor'

export default {
  name: 'App',
  components: {
    Calendar,
    SettingsEditor,
  },
  computed: {
    config() {
      return [
        {
          type: 'TextInput',
          value: 'henlo',
          key: 'key1',
          order: 2
        },
        {
          type: 'CheckboxInput',
          key: 'key2',
          order: 1,
        }
      ]
    },
  }
}
</script>

<style>

</style>
