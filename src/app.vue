<template>
  <div id="app">
    <!-- <TestForm :config="config"></TestForm> -->
    <!-- <CzSorter></CzSorter> -->
    <!-- <Calendar></Calendar> -->
    <StateEditor></StateEditor>
  </div>
</template>

<script>
import TestForm from './components/test-form'
import CzSorter from './components/cz-sorter'
import BootstrapCss from 'bootstrap-css-only'
import Calendar from './components/calendar'
import SettingsEditor from './components/settings-editor'
import StateEditor from './components/state-editor'

export default {
    name: 'App',
    components: {
        StateEditor,
    },
    computed: {
        config() {
            return [
                {
                    type: 'TextInput',
                    value: 'henlo',
                    key: 'key1',
                    order: 2,
                },
                {
                    type: 'CheckboxInput',
                    key: 'key2',
                    order: 1,
                },
            ]
        },
    },
}
</script>

<style>

</style>
