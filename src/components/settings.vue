<template>
  <div class="settings-leaf">
    <component :is="`h${depth + 1}`" class="settings-h">{{ title }}</component>
    <div v-if="editableKeys.length" class="settings-headding">
      <div>Název</div>
      <div>Výchozí hodnota</div>
      <div></div>
      <div>Uživatelská hodnota</div>
    </div>
    <div class="settings-values">
      <template v-for="k in editableKeys">
        <label :key="`label-${k}-${formId}`" :for="`input-${k}-${formId}`">
          <div 
            :class="{'has-description': schema.properties[k].description}"
            @click="toggleDescription(k)">
            {{ schema.properties[k].title }}
            <span class="value-key">( {{path}}.{{k}} )</span>
          </div>
          <div class="value-description" v-if="showDescription[k]">
            {{ schema.properties[k].description }}
          </div>
        </label>
        <div :key="`default-${k}-${formId}`">
          {{ humanReadableDefaultValue[k] }}
        </div>
        <div :key="`override-${k}-${formId}`">
          <div class="override-switch" :class="{'active': override[k]}" @click="toggleOverride(k)">
            <div></div>
          </div>
        </div>
        <div :key="`input-${k}-${formId}`">
          <input :pattern="inputPatternByKey[k]"
                 :name="k"
                 :id="`input-${k}-${formId}`"
                 :type="inputTypeByKey[k]"
                 :value="value[k]"
                 :disabled="!override[k]"
                 :required="override[k]"
                 :min="intrangeByKey[k][0]"
                 :max="intrangeByKey[k][1]"
                 class="grid-input"
                 autocomplete="off"
                 @input="inputChanged"
          />

          <div v-if="inputValidityHintByKey[k]" class="grid-input-validation">{{ inputValidityHintByKey[k] }}</div>
          <ul v-if="inputExamplesByKey[k]" class="grid-input-examples">
            <li v-for="(e, i) in inputExamplesByKey[k]" :key="i">{{ e }}</li>
          </ul>
        </div>
      </template>
    </div>
    <Settings v-for="k in childKeys"
              :schema="schema.properties[k]"
              v-model="value[k]"
              :defaultValue="defaultValue[k]"
              :depth="inc(depth)"
              :key="k"
              @input="childChanged"
              @inputOverride="childOverrideChanged(k, $event)"
              @inputValid="childValidChanged(k, $event)"
              :path="[path, k].join('.')"
              ></Settings>
  </div>
</template>

<script>
import _ from 'lodash'
import uuid from 'uuid'

const humanReadableValue = value => {
    if (value === true) return 'zapnuto'
    if (value === false) return 'vypnuto'
    if (_.isArray(value)) return value.join(';')
    return value
}

export default {
    name: 'Settings',
    props: {
        value: {
            type: null,
            required: true,
            default: _ => {return {}},
        },
        defaultValue: {
            type: null,
            required: false,
            default: _ => {return {}},
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
        },
        path: {
            type: String,
            required: false,
            default: _ => '',
        }
    },
    data() {
        return {
            override: {},
            showDescription: {},
            valid: {},
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
        inputDefaultByKey() {
            return _.zipObject(this.editableKeys, this.editableKeys.map(key => _.get(this.schema, `properties.${key}.default`, '')))
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
        intrangeByKey() {
            return _.zipObject(this.editableKeys, this.editableKeys.map(key => _.get(this.schema, `properties.${key}.validityIntRange`, [])))
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
    },
    mounted() {
      _.map(this.editableKeys, k => {
        if(_.get(this.value, k, undefined) !== undefined) {
          this.$set(this.override, k, true)
        }
      })
      this.$emit('inputOverride', this.override)
    },
    methods: {
        inc(number) {
            return _.clone(number) + 1
        },
        filterValid(values) {
          let pick = _.pickBy(_.clone(values), (v,k) => {
            return this.override[k] && this.valid[k]
          })
          return pick
        },
        toggleOverride(key) {
          if (_.get(this.override, key, false)) {
            this.$set(this.override, key, false)
          } else {
            this.$set(this.override, key, true)
          }
          if(_.get(this.override, key, false)) {
            delete this.value[key]
          }
          if(_.get(this.value, key) === undefined) {
            this.$set(this.value, key, this.inputDefaultByKey[key])
            this.$set(this.valid, key, true)
            this.$emit('inputValid', this.valid)
          }
          this.$emit('inputOverride', this.override)
        },
        inputChanged(e) {
            const key = e.target.name
            const type = _.get(this.schema, `properties.${key}.type`)
            const rawValue = e.target.value
            let valid = e.target.validity.valid
            let value
            let remove = false
            switch (type) {
              case 'integer':
                value = _.parseInt(rawValue)
                if (isNaN(value)) remove = true
                break
              case 'array':
                value = _.split(rawValue, ';')
                if (!_.isArray(value) || value.length === 0) remove = true
                break
              case 'boolean':
                value = e.target.checked
                valid = true
                break
              default:
                value = rawValue
                if (value.length === 0) remove = true
            }
            this.$set(this.valid, key, valid)
            if (remove) {
                delete this.value[key]
            } else {
                _.set(this.value, key, value)
            }
            this.$emit('input', this.value)
            this.$emit('inputValid', this.valid)
        },
        childChanged(e) {
            this.$emit('input', this.value)
        },
        childOverrideChanged(key, e) {
          this.$set(this.override, key, e)
          this.$emit('inputOverride', this.override)
        },
        childValidChanged(key, e) {
          this.$set(this.valid, key, e)
          this.$emit('inputValid', this.valid)
        },
        toggleDescription(key) {
          if(this.schema.properties[key].description) {
            if(this.showDescription[key] === true) {
              this.$set(this.showDescription, key, false)
            } else {
              this.$set(this.showDescription, key, true)
            }
          }
        },
    },
}
</script>

<style scoped>
.settings-values, .settings-headding {
  display: grid;
  grid-template-columns: 2fr 1fr 60px 1fr;
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
  text-align: left;
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
.has-description {
  cursor: help;
}
.value-description {
  text-align: left;
  font-size: 80%;
  margin: 2px 0 2px 0.3rem;
  font-style: italic;
  color: black;
  background-color: rgba(0,0,0,0.05);
  padding: 5px 10px;
  border: 1px solid lightgrey;
  border-radius: 5px;
}
.value-key {
  font-size: 90%;
  font-style: italic;
  color: var(--warning);
  white-space: nowrap;
}
.override-switch {
    display: block;
    width: 45px;
    height: 20px;
    border-radius: 10px;
    background-color: var(--secondary);
    box-shadow: 0px 0px 3px 0px var(--secondary);
    cursor: pointer;
}
.override-switch.active {
  background-color: var(--success);
  box-shadow: 0px 0px 3px 0px var(--success);
}
.override-switch > div {
  display: block;
    width: 16px;
    height: 16px;
    border-radius: 9px;
    background-color: white;
    margin-top: 0;
    transform: translate(2px, 2px);
    transition: margin-left 200ms;
}
.override-switch.active > div {
  margin-left: 24px;
}

</style>
