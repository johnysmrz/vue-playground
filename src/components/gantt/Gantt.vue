<template>
  <div class="ag-main">
    <div style="grid-area: controls">
      <button @click="zoomIn()">zoom -</button>
      <button @click="zoomOut()">zoom +</button>
      <button @click="showDGrid = !showDGrid">Toggle debug grid</button>
      <button @click="scrollToNow()">Nyni</button>
    </div>

    <div v-if="showDGrid" class="debug-grid" style="grid-area: track; z-index: 999">
      <div v-for="(row, i) in grid" :key="`dgrid-row-${i}`">
        <div v-for="col in row" :key="`dgrid-cell-${col.x}-${col.y}`" :class="{'dgrid-obstacle': col.obstacle}">
          {{ col.x }}:{{ col.y }}
        </div>
      </div>
    </div>

    <div :id="`track-area-${id}`" class="ag-grid" style="grid-area: track" @scroll="onScroll">
      <svg
        :height="`${layout.height}px`"
        :width="`${layout.main.width}px`"
        @mousemove="mouseMove"
        @mouseup="mouseUp">
        <defs>
          <marker id="arrow"
                  markerWidth="12"
                  markerHeight="10"
                  refX="10"
                  refY="5"
                  orient="auto"
                  markerUnits="userSpaceOnUse">
            <path d="M0,0 L0,10 L12,5 z" fill="dimgray" />
          </marker>
          <marker id="feather"
                  markerWidth="11"
                  markerHeight="11"
                  refX="-3"
                  refY="3"
                  orient="auto"
                  markerUnits="userSpaceOnUse">
            <circle
              cx="3"
              cy="3"
              r="3"
              stroke="black"
              stroke-width="0"
              fill="DimGray" />
          </marker>
        </defs>
        <!-- draw tracks bg -->
        <g>
          <rect
            :height="LABEL_TRACK_HEIGHT"
            y="0"
            x="0"
            width="100%"
            fill="AliceBlue"
            shape-rendering="crispEdges"
          />
        </g>
        <g v-for="t in tracksDraw" :key="t.id">
          <rect
            :y="t.draw.mid"
            :height="TRACK_HEIGHT"
            x="0"
            width="100%"
            fill="WhiteSmoke"
            shape-rendering="crispEdges" />
        </g>
        <g v-for="d in days" :key="`day-${d.id}`">
          <rect
            v-if="d.isHoliday"
            :x="d.draw.left"
            :width="d.draw.right - d.draw.left"
            :title="d.holiday"
            y="0"
            height="100%"
            fill="Orange"
            fill-opacity="0.2"
            shape-rendering="crispEdges" />
          <rect
            v-if="d.isWeekend"
            :x="d.draw.left"
            :width="d.draw.right - d.draw.left"
            y="0"
            height="100%"
            fill="Yellow"
            fill-opacity="0.2"
            shape-rendering="crispEdges" />
          <line
            :x1="d.draw.left"
            :x2="d.draw.left"
            y1="0"
            y2="250"
            shape-rendering="crispEdges"
            stroke-width="1px"
            stroke-dasharray="5, 5"
            stroke="Silver" />
          <text
            :x="d.draw.labelAnchor"
            :y="LABEL_TRACK_HEIGHT - 8"
            fill="DimGray"
            font-size="12px"
            text-anchor="middle"
            @mouseenter="setDayInfo(d)"
            @mouseleave="setDayInfo(undefined)"
          >
            {{ d.label }}
          </text>
        </g>

        <path v-for="(p, i) in dependPaths"
              :key="`deped-path-${i}`"
              :d="p.path"
              :stroke="highlightId === p.to.id ? 'LimeGreen' : 'DimGray'"
              :stroke-width="highlightId === p.to.id ? '3px' : '1px'"
              fill="transparent"
              marker-end="url(#arrow)"
              marker-start="url(#feather)" />

        <GanttEntity
          v-for="e in entities"
          :key="`${e.draw.left}-${e.draw.right}`"
          :entity="e"
          @dragStart="entityDragStart"
          @highlightStart="highlightStart"
          @highlightEnd="highlightEnd"
        ></GanttEntity>

        <g>
          <line
            :x1="nowLine.draw.x1"
            :x2="nowLine.draw.x2"
            :y1="nowLine.draw.y1"
            :y2="nowLine.draw.y2"
            shape-rendering="crispEdges"
            stroke-width="1px"
            stroke="red"
            stroke-dasharray="2, 2"
          />
          <text
            :x="nowLine.draw.x1"
            :y="nowLine.draw.y1 + 1"
            fill="red"
            font-size="8px"
            text-anchor="middle"
          >
            nyní
          </text>
        </g>

        <g v-if="entityChange">
          <rect
            v-if="changeIndicator !== undefined"
            :x="changeIndicator.left"
            :y="changeIndicator.top"
            :width="changeIndicator.right - changeIndicator.left"
            height="15"
            stroke-width="1"
            stroke="Black"
            fill="Gray"
            opacity="0.4"
            stroke-dasharray="4, 4"
          />
          <rect
            :x="layout.scroll + entityChange.mouse.x"
            :y="entityChange.mouseStart.y - 10"
            width="170"
            height="20"
            rx="6"
            stroke="DimGray"
            shape-rendering="crispEdges"
            stroke-width="1"
            fill="Gold" />
          <text
            :x="layout.scroll + entityChange.mouse.x + 5"
            :y="entityChange.mouseStart.y + 3"
            fill="DimGray"
            font-size="12px"
          >
            {{ changeIndicator.label }}
          </text>
        </g>

        <g v-if="dayInfo">
          <rect
            :x="dayInfo.draw.labelAnchor - 111"
            :y="LABEL_TRACK_HEIGHT + 2"
            :height="dayInfo.infoLabels.length * 20"
            width="222"
            rx="3"
            ry="3"
            stroke="Black"
            shape-rendering="crispEdges"
            stroke-width="1"
            fill="LightBlue"
          />
          <text
            :x="dayInfo.draw.labelAnchor"
            :y="LABEL_TRACK_HEIGHT + 12"
            :height="dayInfo.infoLabels.length * 20"
            fill="Black"
            font-size="10px"
            text-anchor="middle"
            width="222"
          >
            <tspan
              v-for="(l,i) in dayInfo.infoLabels"
              :key="`info-label-line-${i}`"
              :x="dayInfo.draw.labelAnchor"
              :y="LABEL_TRACK_HEIGHT + (i * 17) + 15"
            >
              {{ l }}
            </tspan>
          </text>
        </g>

      </svg>
    </div>
    <pre style="grid-area: debug">{{ entityChange }}{{ changeIndicator }}{{ layout }}</pre>
  </div>
</template>

<script>
import { map, clamp, range, size, get, find, each, floor, join, clone, min, max, findIndex } from 'lodash'
import tinycolor from 'tinycolor2'
import GanttEntity from './Entity'
import { ZOOM_STEPS, TRACK_HEIGHT, ENTITY_HEIGHT, HANDLES_BRIGHTNESS } from './consts'
import moment from '../moment-ext'
import PF from 'pathfinding'

moment.locale('cs')

const GRID_SIZE = 25

const data = [
    {
        id: '1',
        label: 'Ukol1',
        type: 'project',
        startTime: moment('2020-06-25 23:59:59+0200').unix(),
        endTime: moment('2020-06-27 12:00:00+0200').unix(),
        color: 'DarkSlateBlue',
        dependOn: [],
    },
    {
        id: '2',
        label: 'Ukol2',
        type: 'project',
        startTime: moment('2020-07-02 23:59:59+0200').unix(),
        endTime: moment('2020-07-03 12:00:00+0200').unix(),
        parent: '1',
        dependOn: ['1'],
        color: 'Green',
    },
    {
        id: '3',
        label: 'Ukol3',
        type: 'project',
        startTime: moment('2020-07-11 23:59:59+0200').unix(),
        endTime: moment('2020-07-15 12:00:00+0200').unix(),
        parent: '2',
        color: 'Firebrick',
        dependOn: ['1'],
        assigned: ['TH', 'JS'],
    },
    {
        id: '4',
        label: 'Ukol4',
        type: 'project',
        startTime: moment('2020-07-7 23:59:59+0200').unix(),
        endTime: moment('2020-08-12 12:00:00+0200').unix(),
        parent: '1',
        dependOn: ['3', '1'],
        color: 'Orange',
    },
]

const gridPath2svgPath = ({ fromHandle, gridPath = [], toHandle }) => {
    const coords = map(gridPath, ([x, y]) => {
        return [
            x * GRID_SIZE + (GRID_SIZE / 2),
            y * GRID_SIZE + (GRID_SIZE / 2),
        ]
    })
    const drawCommands = [`M ${fromHandle.x} ${fromHandle.y}`]
    each(coords, ([x, y], i) => {
        drawCommands.push(`L ${x} ${y}`)
    })
    drawCommands.push(`L ${toHandle.x} ${toHandle.y}`)

    return join(drawCommands, ' ')
}

const finder = new PF.AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true,
})

const LABEL_TRACK_HEIGHT = 25
const MIN_PAST_DAYS_OFFSET = 3
const MIN_FUTURE_DAYS_OFFSET = 3

export default {
    name: 'Gantt',
    components: {
        GanttEntity,
    },
    data() {
        return {
            zoomIndex: 3,
            entityChange: undefined,
            highlightId: undefined,
            dayInfo: undefined,
            mouse: { x: 0, y: 0 },
            ZOOM_STEPS,
            TRACK_HEIGHT,
            ENTITY_HEIGHT,
            currentPath: [],
            showDGrid: false,
            LABEL_TRACK_HEIGHT,
            pastDaysOffset: MIN_PAST_DAYS_OFFSET,
            futureDaysOffset: MIN_FUTURE_DAYS_OFFSET,
            data,
            scrollLeft: 0,
        }
    },
    computed: {
        /**
         * @description
         * @return {String}
         */
        id() {
            return '5bbe95ea-b8c2-4136-8bc4-561f1aa1fd32'
        },
        nowLine() {
            const x = this.timeToX(moment())
            return {
                draw: {
                    x1: x,
                    x2: x,
                    y1: LABEL_TRACK_HEIGHT,
                    y2: size(this.entities) * 2 * LABEL_TRACK_HEIGHT + LABEL_TRACK_HEIGHT,
                },
            }
        },
        dayWidth() {
            return 24 * this.zoom
        },
        days() {
            const currentOffset = moment().utcOffset()
            const start = moment(this.firstTimestamp, 'X').startOf('day').subtract(this.pastDaysOffset, 'days').utcOffset(currentOffset)
            const end = moment(this.lastTimestamp, 'X').endOf('day').add(this.futureDaysOffset, 'days').utcOffset(currentOffset)

            let labelFormat = 'dddd DD.MM.YYYY'
            if (this.dayWidth < 25) {
                labelFormat = 'D'
            } else if (this.dayWidth < 50) {
                labelFormat = 'D.M'
            } else if (this.dayWidth < 100) {
                labelFormat = 'dd DD.MM'
            }

            return map(Array.from(moment().range(start, end).by('days', { excludeEnd: true }), (d, i) => {
                const left = i * this.dayWidth
                const right = i * this.dayWidth + this.dayWidth - 1
                const labelAnchor = left + (this.dayWidth / 2)

                const infoLabels = [
                    `${d.format('dddd DD.MM.YYYY')}`,
                ]
                if (d.isHoliday()) {
                    infoLabels.push(`${join(d.getHoliday(), ',')}`)
                }
                if (d.isWeekend()) {
                    infoLabels.push('Víkend')
                }
                infoLabels.push(d.fromNow())

                return {
                    id: d.format(),
                    label: d.format(labelFormat),
                    infoLabels,
                    isWeekend: d.isWeekend(),
                    isHoliday: d.isHoliday(),
                    holiday: d.getHoliday(),
                    draw: { left, right, labelAnchor },
                }
            }))
        },
        layout() {
            const gridHeight = (TRACK_HEIGHT * size(this.entities) * 2)
            const width = size(this.days) * this.dayWidth
            return {
                height: LABEL_TRACK_HEIGHT + gridHeight,
                scroll: this.scrollLeft,
                main: {
                    top: LABEL_TRACK_HEIGHT,
                    left: 0,
                    bottom: LABEL_TRACK_HEIGHT + gridHeight,
                    width,
                },
            }
        },
        zoom() {
            return ZOOM_STEPS[this.zoomIndex]
        },
        firstTimestamp() {
            return min(map(this.data, e => e.startTime))
        },
        lastTimestamp() {
            return max(map(this.data, e => e.endTime))
        },
        entities() {
            return map(this.data, (e, i) => {
                const left = this.timeToX(moment(e.startTime, 'X'))
                const right = this.timeToX(moment(e.endTime, 'X'))
                const top = (TRACK_HEIGHT * i * 2) + (TRACK_HEIGHT - ENTITY_HEIGHT) / 2 + LABEL_TRACK_HEIGHT
                const bottom = top + ENTITY_HEIGHT
                const color = get(e, 'color', 'Gray')
                const handleColor = tinycolor(color).brighten(HANDLES_BRIGHTNESS).toString()

                this.$set(e, 'draw', {
                    left,
                    right,
                    top,
                    bottom,
                    color,
                    handleColor,
                })
                return e
            })
        },
        tracksDraw() {
            return map(range(size(this.entities)), i => {
                return {
                    id: `track-${i}`,
                    index: i,
                    draw: {
                        top: 2 * i * TRACK_HEIGHT + LABEL_TRACK_HEIGHT,
                        mid: (2 * i * TRACK_HEIGHT) + TRACK_HEIGHT + LABEL_TRACK_HEIGHT,
                        bottom: (2 * i * TRACK_HEIGHT) + 2 * TRACK_HEIGHT + LABEL_TRACK_HEIGHT,
                    },
                }
            })
        },
        grid() {
            const widthInPx = max(map(this.entities, e => e.draw.right))
            const heightInPx = max(map(this.entities, e => e.draw.bottom))
            const gridW = Math.ceil(widthInPx / GRID_SIZE)
            const gridH = Math.ceil(heightInPx / GRID_SIZE) + 1

            const grid = map(range(gridH), y => {
                return map(range(gridW), x => {return { x, y, obstacle: false }})
            })
            each(this.entities, e => {
                const left = get(e, 'draw.left')
                const rigtht = get(e, 'draw.right')
                const top = get(e, 'draw.top')
                const gridY = floor(top / 25)
                const gridX = map(range(left, rigtht + GRID_SIZE, GRID_SIZE), x => floor(x / GRID_SIZE))
                each(gridX, x => {
                    try {
                        grid[gridY][x].obstacle = true
                    } catch (e) {
                        console.error(e)
                    }
                })
            })
            return grid
        },
        pathfindingGrid() {
            return new PF.Grid(map(this.grid, row => {
                return map(row, cell => {
                    return get(cell, 'obstacle', false) ? 1 : 0
                })
            }))
        },
        changeIndicator() {
            if (this.entityChange !== undefined) {
                const fixedStart = this.entityChange.position === 'end'
                const fixedEnd = this.entityChange.position === 'start'
                let left = this.entityChange.entity.draw.left
                let right = this.entityChange.entity.draw.right
                const top = this.entityChange.entity.draw.top
                const bottom = this.entityChange.entity.draw.bottom

                if (!fixedStart) {
                    left = this.entityChange.entity.draw.left + this.entityChange.offsetX
                }

                if (!fixedEnd) {
                    right = this.entityChange.entity.draw.right + this.entityChange.offsetX
                }

                const label = `${this.xToTime(left).format('DD.MM HH:mm')} - ${this.xToTime(right).format('DD.MM HH:mm')}`

                return {
                    left,
                    right,
                    top,
                    bottom,
                    label,
                }
            }
            return undefined
        },
        dependPaths() {
            const dependEntitiesPairs = []
            each(this.entities, entity => {
                each(get(entity, 'dependOn', []), dependOnId => {
                    const dependOnEntity = find(this.entities, { id: dependOnId })
                    dependEntitiesPairs.push({
                        from: dependOnEntity,
                        to: entity,
                    })
                })
            })
            const gridPaths = map(dependEntitiesPairs, ({ from, to }) => {
                const fromGrid = {
                    x: floor(get(from, 'draw.right') / TRACK_HEIGHT) + 1,
                    y: floor(get(from, 'draw.top') / TRACK_HEIGHT),
                }
                const toGrid = {
                    x: floor(get(to, 'draw.left') / TRACK_HEIGHT) - 1,
                    y: floor(get(to, 'draw.top') / TRACK_HEIGHT),
                }
                const gridPath = finder.findPath(fromGrid.x, fromGrid.y, toGrid.x, toGrid.y, this.pathfindingGrid.clone())
                return {
                    from,
                    fromHandle: {
                        x: floor(get(from, 'draw.right')),
                        y: floor(get(from, 'draw.top') + (ENTITY_HEIGHT / 2)),
                    },
                    gridPath,
                    toHandle: {
                        x: floor(get(to, 'draw.left')),
                        y: floor(get(to, 'draw.top') + (ENTITY_HEIGHT / 2)),
                    },
                    to,
                }
            })
            return map(gridPaths, gp => {
                return { path: gridPath2svgPath(gp), from: gp.from, to: gp.to }
            })
        },
    },
    mounted() {
        // najdeme optimalni zoom pro aktualni data
        const containerWidth = document.getElementById(`track-area-${this.id}`).clientWidth
        const optimalIndex = findIndex(ZOOM_STEPS, zs => {
            return 24 * zs > containerWidth / (size(this.days))
        })
        this.zoomIndex = clamp(optimalIndex, 0, size(ZOOM_STEPS) - 1)

        // doscrolujem na prvni zaznam
        setTimeout(_ => {
            this.scrollToTime(moment(this.firstTimestamp, 'X'), {
                offset: 20,
                align: 'left',
            })
        }, 200)
    },
    methods: {
        mouseUp() {
            if (this.entityChange !== undefined) {
                const left = this.changeIndicator.left
                const right = this.changeIndicator.right
                const fromTimestamp = this.xToTime(left)
                const toTimestamp = this.xToTime(right)

                const entity = find(this.data, e => e.id === this.entityChange.id)
                this.$set(entity, 'startTime', fromTimestamp.unix())
                this.$set(entity, 'endTime', toTimestamp.unix())

                this.entityChange = undefined
                // this.$forceUpdate()
                // this.$children.forEach(vm => vm.$forceUpdate())
            }
        },
        zoomIn() {
            this.zoomIndex = clamp(this.zoomIndex - 1, 0, size(ZOOM_STEPS) - 1)
        },
        zoomOut() {
            this.zoomIndex = clamp(this.zoomIndex + 1, 0, size(ZOOM_STEPS) - 1)
        },
        entityDragStart(e) {
            this.entityChange = {
                ...e,
                mouseStart: clone(this.mouse),
                mouse: this.mouse,
                offsetX: 0,
            }
        },
        mouseMove(e) {
            this.$set(this.mouse, 'x', get(e, 'clientX'))
            this.$set(this.mouse, 'y', get(e, 'clientY'))
            if (this.entityChange !== undefined) {
                const offsetX = this.mouse.x - this.entityChange.mouseStart.x
                this.$set(this.entityChange, 'mouse', this.mouse)
                this.$set(this.entityChange, 'offsetX', offsetX)
            }
        },
        highlightStart(e) {
            this.highlightId = get(e, 'id')
        },
        highlightEnd(e) {
            this.highlightId = undefined
        },
        /**
         * @description Vraci X souradnici pro dany datetime v zavislosti vuci prvnimu dni grafu
         * @param {Moment} datetime
         * @return {Float}
         */
        timeToX(datetime) {
            const currentOffset = moment().utcOffset()
            const start = moment(this.firstTimestamp, 'X')
                .startOf('day')
                .subtract(this.pastDaysOffset, 'days')
                .utcOffset(currentOffset)
            const diffDays = datetime.diff(start, 'days', true)
            return diffDays * 24 * this.zoom
        },
        xToTime(x) {
            const currentOffset = moment().utcOffset()
            return moment(this.firstTimestamp, 'X')
                .subtract(this.pastDaysOffset + 1, 'days')
                .add(x / this.zoom, 'hours')
                .utcOffset(currentOffset)
        },
        setDayInfo(d) {
            this.dayInfo = d
        },
        scrollToTime(datetime, opts = {}) {
            const { offset = 0, align = 'left' } = opts
            const containerWidth = document.getElementById(`track-area-${this.id}`).clientWidth
            let scrollLeft = this.timeToX(datetime) - offset

            if (align === 'center') {
                scrollLeft = scrollLeft - (containerWidth / 2)
            }
            scrollLeft = clamp(scrollLeft, 0, containerWidth)
            document.getElementById(`track-area-${this.id}`).scroll({
                top: 0,
                left: scrollLeft,
                behavior: 'smooth',
            })
        },
        scrollToNow() {
            this.scrollToTime(moment(), { align: 'center' })
        },
        onScroll(e) {
            this.scrollLeft = e.target.scrollLeft
        },
    },
}
</script>

<style scoped>
.ag-main {
    display: grid;
    grid-template-columns: 300px auto;
    grid-template-rows: 20px auto;
    grid-template-areas:
        ". controls"
        "descheader trackheader"
        "track track"
        "debug debug";
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    background-color: White;
    color: gray;
}
.ag-track, .ag-description-track {
    height: 29px;
    border-bottom: 1px solid LightGray;
    border-right: 1px solid LightGray;
}
.ag-description-track {
    border-right: 1px solid LightGray;
    border-left: 1px solid LightGray;
    line-height: 29px;
    padding: 0 10px;
}
.ag-task {
    min-width: 30px;
    height: 20px;
    border: 1px solid black;
    position: relative;
    display: grid;
    grid-template-columns: 10px auto 10px;
}
.ag-task-handle {
    background-color: red;
    cursor: ew-resize;
}
.debug-grid {
    padding: 0;
    border-left: 1px dashed black;
    border-top: 1px dashed black;
    width: min-content;
}
.debug-grid > div {
    display: flex;
    flex-direction: row;
}
.debug-grid > div > div {
    width: 24px;
    height: 24px;
    padding: 0;
    margin: 0;
    border-spacing: 0;
    border-right: 1px dashed black;
    border-bottom: 1px dashed black;
    text-align: center;
    line-height: 24px;
    font-size: 8px;
    color: black;
    background-color: rgba(255,255,255,0.5);
}
.dgrid-obstacle {
    color: red !important;
}
.ag-grid {
    overflow: scroll;
    transition-duration: 5000ms;
    user-select: none;
}
</style>

