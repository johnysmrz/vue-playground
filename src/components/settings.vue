<template>
  <div class="settings-leaf">
    <component :is="`h${depth + 1}`">{{ title }}</component>
    <div class="settings-values">
      <template v-for="k in editableKeys">
        <label :key="`label-${k}-${formId}`" :for="`input-${k}-${formId}`">{{ schema.properties[k].title }}</label>
        <div :key="`default-${k}-${formId}`">{{ defaultValue[k] }}</div>
        <input class="grid-input" :pattern="inputPatternByKey[k]" :key="`input-${k}-${formId}`" :name="k" :id="`input-${k}-${formId}`" :type="inputTypeByKey[k]" v-model="value[k]" @input="inputChanged" :class="{'no-value': !value[k]}"/>
        <div class="grid-input-validation">Validation text</div>
      </template>
    </div>
    <Settings v-for="k in childKeys" :schema="schema.properties[k]" v-model="value[k]" :defaultValue="defaultValue[k]" :depth="inc(depth)" :key="k" @input="childChanged"></Settings>
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
    },
    inputChanged(e) {
      const key = e.target.name
      const type = _.get(this.schema, `properties.${key}.type`)
      const rawValue = e.target.value
      let value
      switch(type) {
        case 'integer':
          value = _.parseInt(rawValue)
          break;
        default:
          value = rawValue
      }
      console.log(`${key}(${type}) ${rawValue}`, value)
      this.$emit('input', this.value)
    },
    childChanged(e) {
      this.$emit('input', this.value)
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
    inputTypeByKey() {
      return _.zipObject(this.editableKeys, this.editableKeys.map(key => {
        const type = _.get(this.schema, `properties.${key}.type`)
        if (type === 'integer') return 'number'
        if (type === 'boolean') return 'checkbox'
        return 'text'
      }))
    },
    inputPatternByKey() {
      return _.zipObject(this.editableKeys, this.editableKeys.map(key => _.get(this.schema, `properties.${key}.pattern`)))
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
  }
}
</script>

<style>
.settings-values {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
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
.grid-input:focus {
  border-color: var(--primary);
}
.grid-input:invalid {
  border-color: var(--danger);
}
.grid-input:valid {
  border-color: var(--success);
}
textarea.grid-input, select.grid-input, input.grid-input, button.grid-input { 
  outline: none; 
}
.grid-input.no-value {
  background: repeating-linear-gradient(135deg,transparent,transparent 7px,rgba(0,0,0,.03) 0,rgba(0,0,0,.03) 14px)
}
</style>
