<template>
  <div style="color: red">
    Base input component
  </div>
</template>

<script>
export default {
    name: 'BaseInput',
    props: {
        value: {
            type: String | undefined,
            required: true,
        },
        errors: {
            type: Array,
            default: _ => [],
        },
    },
    methods: {
        triggerChange(event) {
            console.info(event.target.value)
            this.$emit('input', event.target.value)
        },
    },
}
</script>

<style>

</style>
