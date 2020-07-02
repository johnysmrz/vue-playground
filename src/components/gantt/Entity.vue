<template>
  <g>
    <text :y="entity.draw.top + 12"
          :x="entity.draw.left - 20"
          :fill="entity.draw.color"
          font-family="Monospace"
          text-anchor="end"
          font-size="15px">
      {{ entity.label }}
    </text>
    <rect :y="entity.draw.top"
          :x="entity.draw.left"
          :width="entity.draw.right - entity.draw.left"
          :height="ENTITY_HEIGHT"
          :fill="entity.draw.color"
          cursor="ew-resize"
          shapeRendering="crispEdges"
          @mousedown="dragStart('both')"
          @mouseover="mouseOver"
          @mouseleave="mouseLeave"
    />
    <rect :y="entity.draw.top"
          :x="entity.draw.left"
          :width="ENTITY_HEIGHT"
          :height="ENTITY_HEIGHT"
          :fill="dragged == 'start' ? 'red' : entity.draw.handleColor"
          cursor="w-resize"
          @mousedown="dragStart('start')"
    />
    <rect :y="entity.draw.top"
          :x="entity.draw.right - ENTITY_HEIGHT"
          :width="ENTITY_HEIGHT"
          :height="ENTITY_HEIGHT"
          :fill="dragged == 'end' ? 'red' : entity.draw.handleColor"
          cursor="e-resize"
          @mousedown="dragStart('end')"
    />
    <g v-for="(a, i) in assigned"
       :key="a">
      <circle :cx="entity.draw.right + 30 + (i * 30)"
              :cy="entity.draw.top + 8"
              r="12"
              stroke="black"
              strokeWidth="1"
              fill="white"
              fill-opacity="0.5" />
      <text :x="entity.draw.right + 30 + (i * 30)"
            :y="entity.draw.top + 12"
            font-family="Monospace"
            text-anchor="middle"
            font-size="15px"
            title="Jan ewqewq">
        {{ a }}
      </text>
    </g>
  </g>
</template>

<script>
import { get } from 'lodash'
import { ZOOM_STEPS, TRACK_HEIGHT, ENTITY_HEIGHT } from './consts'

export default {
    name: 'GanttEntity',
    props: {
        entity: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            ZOOM_STEPS,
            TRACK_HEIGHT,
            ENTITY_HEIGHT,
            dragged: undefined,
        }
    },
    computed: {
        id() {
            return get(this.entity, 'id')
        },
        assigned() {
            return get(this.entity, 'assigned', [])
        },
    },
    methods: {
        dragStart(position) {
            this.dragged = position
            this.$emit('dragStart', { id: this.id, position, entity: this.entity })
        },
        mouseOver(e) {
            this.$emit('highlightStart', { id: this.id })
        },
        mouseLeave(e) {
            this.$emit('highlightEnd', { id: this.id })
        },
    },
}
</script>
