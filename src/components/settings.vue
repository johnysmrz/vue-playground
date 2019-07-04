<template>
  <div class="settings-leaf">
    <component :is="`h${depth + 1}`" class="settings-h">{{ title }}</component>
    <div class="settings-headding" v-if="editableKeys.length">
      <div>Nazev</div>
      <div>Systemove nastaveni</div>
      <div></div>
      <div>Uzivatelske nastaveni</div>
    </div>
    <div class="settings-values">
      <template v-for="k in editableKeys">
        <label :key="`label-${k}-${formId}`" :for="`input-${k}-${formId}`">{{ schema.properties[k].title }}</label>
        <div :key="`default-${k}-${formId}`">
          {{ humanReadableDefaultValue[k] }}
        </div>
        <div :key="`override-${k}-${formId}`">
          <input type="checkbox" v-model="override[k]" />
        </div>
        <div :key="`input-${k}-${formId}`">
          <input class="grid-input" autocomplete="off" :pattern="inputPatternByKey[k]" :name="k" :id="`input-${k}-${formId}`" :type="inputTypeByKey[k]" :value="value[k]" @input="inputChanged" :disabled="!override[k]" :required="override[k]" />
          <div class="grid-input-validation" v-if="inputValidityHintByKey[k]">{{ inputValidityHintByKey[k] }}</div>
          <ul v-if="inputExamplesByKey[k]" class="grid-input-examples">
            <li v-for="(e, i) in inputExamplesByKey[k]" :key="i">{{ e }}</li>
          </ul>
        </div>
      </template>
    </div>
    <Settings v-for="k in childKeys" :schema="schema.properties[k]" v-model="value[k]" :defaultValue="defaultValue[k]" :depth="inc(depth)" :key="k" @input="childChanged"></Settings>
  </div>
</template>

<script>
import _ from 'lodash'
import uuid from 'uuid'

const humanReadableValue = value => {
  if(value === true) return 'zapnuto'
  if(value === false) return 'vypnuto'
  if(_.isArray(value)) return value.join(';')
  return value
}

export default {
  name: 'Settings',
  data() {
    return {
      override: {},
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
      let remove = false
      switch(type) {
        case 'integer':
          value = _.parseInt(rawValue)
          if(isNaN(value)) remove = true
          break;
        case 'array':
          value = _.split(rawValue, ';')
          if(!_.isArray(value) || value.length === 0) remove = true
          break;
        case 'boolean':
          value = e.target.checked
          break;
        default:
          value = rawValue
          if(value.length === 0) remove = true
      }
      if(remove) {
        delete this.value[key]
      } else {
        _.set(this.value, key, value)
      }
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
    inputValidityHintByKey() {
      return _.zipObject(this.editableKeys, this.editableKeys.map(key => _.get(this.schema, `properties.${key}.validityHint`, false)))
    },
    inputExamplesByKey() {
      return _.zipObject(this.editableKeys, this.editableKeys.map(key => _.get(this.schema, `properties.${key}.examples`, [])))
    },
    humanReadableDefaultValue() {
      return _.zipObject(this.editableKeys, this.editableKeys.map(key => humanReadableValue(_.get(this, `defaultValue.${key}`))))
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
.settings-values, .settings-headding {
  display: grid;
  grid-template-columns: 2fr 1fr auto 1fr;
  grid-gap: 10px;
}

.settings-values > *, .settings-headding > * {
  align-self: center;
}

.settings-headding > * {
  margin: 3px 0 6px 0;
  color: var(--secondary);
  font-weight: bold;
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
.grid-input:disabled {
  color: lightgray;
  font-style: italic;
  border-style: dashed;
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
.grid-input-validation {
  display: none;
  text-align: justify;
  font-size: 80%;
  margin: 2px 0 2px 0.3rem;
  font-style: italic;
  color: indianred;
  font-weight: bold;
}
.grid-input:invalid + .grid-input-validation {
  display: block;
}
ul.grid-input-examples {
  display: none;
}
.grid-input:invalid ~ ul.grid-input-examples {
  display: block;
}
ul.grid-input-examples > li {
  list-style: none;
  text-align: left;
  font-size: 80%;
  margin: 2px 0 2px 0;
  font-style: italic;
  color: gray;
  font-weight: bold;
}

ul.grid-input-examples > li:before {
  content: "‣";
  color: indianred;
  margin-right: 6px;
}

ul.grid-input-examples {
  margin: 0 0 0 1rem;
  padding: 0;
}

textarea.grid-input, select.grid-input, input.grid-input, button.grid-input { 
  outline: none; 
}
.grid-input.no-value {
  background: repeating-linear-gradient(135deg,transparent,transparent 7px,rgba(0,0,0,.03) 0,rgba(0,0,0,.03) 14px)
}

.settings-h {
  margin: 1rem 0 0 0;
  color: var(--primary);
  text-transform: capitalize;
}

.settings-h::first-letter {
  text-transform: capitalize
}

h1.settings-h {
  font-size: 2rem;
}
h2.settings-h {
  font-size: 1.6rem;
}
h3.settings-h {
  font-size: 1.5rem;
}
h4.settings-h {
  font-size: 1.2rem;
}

</style>
