<template>
  <div class="settings-leaf" :style="cssStyle">
    <component :is="`h${depth + 1}`">{{ title }}</component>
    <div class="settings-values">
      <template v-for="k in editableKeys">
        <label :key="`label-${k}-${formId}`" :for="`input-${k}-${formId}`">{{ schema.properties[k].title }}</label>
        <div :key="`default-${k}-${formId}`">{{ defaultValue[k] }}</div>
        <input class="grid-input" :key="`input-${k}-${formId}`" :id="`input-${k}-${formId}`" type="text" v-model="value[k]" />
      </template>
    </div>
    <Settings v-for="k in childKeys" :schema="schema.properties[k]" v-model="value[k]" :defaultValue="defaultValue[k]" :depth="inc(depth)" :key="k"></Settings>
  </div>
</template>

<script>
import _ from 'lodash'
import uuid from 'uuid'

export default {
  name: 'Settings',
  data() {
    return {
      activeTab: 0,
    }
  },
  props: {
    value: {
      type: null,
      required: true,
      default: _ => {return {}}
    },
    defaultValue: {
      type: null,
      required: false,
      default: _ => {return {}}
    },
    schema: {
      type: Object,
      required: false,
      default: _ => {return {}},
    },
    depth: {
      type: Number,
      required: false,
      default: _ => 0,
    }
  },
  methods: {
    inc(number) {
      return _.clone(number) + 1
    }
  },
  computed: {
    childKeys() {
      return _.chain(_.get(this.schema, 'properties', {}))
              .pickBy(p => _.get(p, 'type') === 'object')
              .keys()
              .value()
    },
    editableKeys() {
      return _.chain(_.get(this.schema, 'properties', {}))
              .pickBy(p => _.get(p, 'type') !== 'object')
              .keys()
              .value()
    },
    title() {
      return _.get(this.schema, 'title', '-- NO TITLE --')
    },
    type() {
      return _.get(this.schema, 'type')
    },
    formId() {
      return uuid()
    },
    cssStyle() {
      return {
        'margin-left': `${this.depth * 0}px`
      }
    }
  }
}
</script>

<style>
.settings-values {
  display: grid;
  grid-template-columns: 1fr 1fr 2fr;
}
.grid-input {
  display: block;
  width: 100%;
  padding: .375rem .75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: .25rem;
  transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
}
</style>
