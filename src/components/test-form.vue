<template>
  <form>
    <component v-for="i in inputs" :key="i.key" :is="i.type" v-model="values[i.key]" :errors="errors[i.key]"></component>
    <button type="button" class="btn btn-primary" @click="submitForm">Budiz</button>
  </form>
</template>

<script>
import _ from 'lodash'
import TextInput from './text-input'
import CheckboxInput from './checkbox-input'

export default {
  name: 'TestForm',
  components: {
    TextInput,
    CheckboxInput,
  },
  props: {
    config: {
      type: Array,
    }
  },
  data() {
    return {
      values: {},
      errors: {},
    }
  },
  methods: {
    submitForm() {
      // console.info(this.values)
      _.each(this.values, (value,key) => {
        console.log(key, value)
        if(key === 'key1') {
          this.errors['key1'] = ['nope']
        }
      })
    }
  },
  computed: {
    inputs() {
      return _.orderBy(this.$props.config, ['order'])
    },
  },
  mounted() {
    _.each(this.$props.config, c => {
      const key = _.get(c, 'key')
      const value = _.get(c, 'value')
      if (key && value) {
        this.$set(this.values, key, _.clone(value))
      } else {
        this.$set(this.values, key, undefined)
      }
      this.$set(this.errors, key, [])
    })
  }
}
</script>

<style>

</style>
