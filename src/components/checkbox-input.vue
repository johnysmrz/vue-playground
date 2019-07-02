<template>
  <div>
    <slot></slot>
    <input type="checkbox" :value="value" @input="triggerChange" />
  </div>
</template>

<script>
import BaseInput from './base-input'

export default {
  name: 'CheckboxInput',
  extends: BaseInput,
}
</script>

<style>

</style>
