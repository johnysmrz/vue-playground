<template>
  <div>
    <slot></slot>
    <input :value="value" type="text" @input="triggerChange" />
    <span v-for="(e, index) in errors" :key="index">{{ e }}</span>
  </div>
</template>

<script>
import BaseInput from './base-input'

export default {
    name: 'TextInput',
    extends: BaseInput,
}
</script>

<style>

</style>
