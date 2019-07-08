<template>
  <div>
    <slot></slot>
    <input :value="value" type="checkbox" @input="triggerChange" />
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
