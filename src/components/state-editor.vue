<template>
  <div>
    <div style="width: 90vw; margin: 10px auto">
      <div v-for="e in examples" class="btn btn-secondary" :key="e" @click="fillWithExample(e)">{{e}}</div>
    </div>
    <div class="state-editor">
      <table class="table">
        <tr>
          <th>nazev</th>
          <th colspan="2">typ</th>
        </tr>
        <tr v-for="(s, i) in states" :key="i">
          <td>{{ s.name }}</td>
          <td>
            <button @click="startState = s.name; update()" :class="{'start': startState === s.name}">prvni</button>
          </td>
          <td>
            <button @click="endState = s.name; update()" :class="{'end': endState === s.name}">posledni</button>
          </td>
          <td>
            <button class="btn btn-danger" @click="removeState(s.name)">X</button>
          </td>
        </tr>
        <tr>
          <td>
            <input type="text" v-model="newState.name" />
          </td>
          <td colspan="3">
            <button @click="addState" class="btn btn-primary">Pridat</button>
          </td>
        </tr>
      </table>

      <table class="table">
        <tr>
          <th>nazev</th>
          <th>ze stavu</th>
          <th>&rarr;</th>
          <th>do stavu</th>
          <th>uzivatel</th>
          <th style="color: goldenrod">notifikovat</th>
          <th></th>
        </tr>
        <template v-for="(c, i) in connections">
          <tr :key="i" @click="update()">
            <td>
              {{ c.name }}
            </td>
            <td>
              {{ c.from }}
            </td>
            <th>&rarr;</th>
            <td>
              {{ c.to }}
            </td>
            <td>
              <input type="checkbox" @click="c.userChangeble = !c.userChangeble" :checked="c.userChangeble"/>
            </td>
            <td>
              <input type="checkbox" @click="c.notify = !c.notify" :checked="c.notify"/>
            </td>
            <td>
              <button class="btn btn-danger" @click="removeConnection(i)">X</button>
            </td>
          </tr>
          <tr :key="`${i}_warnings`" v-if="c.from == endState">
            <td colspan="6" style="border-top: 0 !important">
              <div class="alert alert-danger" role="alert" style="margin: -10px 0px 0 0">
                Z posledniho stavu by nemelo vychazet zadne spojeni
              </div>
            </td>
          </tr>
        </template>
        <tr>
          <td>
            <input type="text" v-model="newConnection.name" />
          </td>
          <td>
            <!-- <input type="text" v-model="newConnection.from" /> -->
            <select v-model="newConnection.from">
              <option v-for="(s, i) in states" :key="i" :value="s.name">{{ s.name }}</option>
            </select>
          </td>
          <th>&rarr;</th>
          <td>
            <!-- <input type="text" v-model="newConnection.to" /> -->
            <select v-model="newConnection.to">
              <option v-for="(s, i) in states" :key="i" :value="s.name">{{ s.name }}</option>
            </select>
          </td>
          <td colspan="4">
            <button @click="addConnection" class="btn btn-primary">Pridat</button>
          </td>
        </tr>
      </table>

      <div v-html="graph"></div>

    </div>
  </div>
</template>

<script>
import Viz from 'viz.js'
import { Module, render } from 'viz.js/full.render'
import _ from 'lodash'

const EXAMPLES = {
  empty: {
    states: [],
    connections: [],
    startState: undefined,
    endState: undefined,
  },
  simplest: {
    states: [
      {name: "novy"},
      {name: "v_reseni"},
      {name: "hotovo"},
    ],
    connections: [
      {name: "otevrit", from: "novy", to: "v_reseni", userChangeble: true, notify: false},
      {name: "dokoncit", from: "v_reseni", to: "hotovo", userChangeble: true, notify: false},
    ],
    startState: "novy",
    endState: "hotovo",
  },
  simple: {
    states: [
      {name: "novy"},
      {name: "blokovany"},
      {name: "k_reseni"},
      {name: "v_reseni"},
      {name: "dokonceny"},
      {name: "schvaleno"},
    ],
    connections: [
      {name: "otevrit1", from: "novy", to: "blokovany", userChangeble: false, notify: false},
      {name: "otevrit", from: "novy", to: "k_reseni", userChangeble: false, notify: true},
      {name: "otevrit2", from: "blokovany", to: "k_reseni", userChangeble: false, notify: true},
      {name: "zacit resit", from: "k_reseni", to: "v_reseni", userChangeble: true, notify: false},
      {name: "dokoncit", from: "v_reseni", to: "dokonceny", userChangeble: true, notify: false},
      {name: "opravit", from: "dokonceny", to: "k_reseni", userChangeble: true, notify: true},
      {name: "schvalit", from: "dokonceny", to: "schvaleno", userChangeble: true, notify: true},
    ],
    startState: "novy",
    endState: "schvaleno",
  },
}

export default {
    name: 'StateEditor',
    data() {
        return {
            graph: undefined,
            graphData: {},
            graphValid: false,
            states: [],
            connections: [],
            newState: {},
            newConnection: {},
            startState: undefined,
            endState: undefined,
        }
    },
    mounted() {
      this.fillWithExample(this.examples[2])
    },
    computed: {
      examples() {
        return _.keys(EXAMPLES)
      }
    },
    methods: {
      removeState(name) {
        let x =_.remove(this.states, s => s.name === name)
        this.update()
      },
      removeConnection(index) {
        _.remove(this.connections, (_,i) => i == index)
        this.update()
      },
      fillWithExample(name) {
        this.states = EXAMPLES[name].states
        this.connections = EXAMPLES[name].connections
        this.startState = EXAMPLES[name].startState
        this.endState = EXAMPLES[name].endState
        this.update()
      },
      async update() {
        try {
          let states = this.states.map(s => {
            let props = ''
            if(s.name === this.startState) {
              props = '[color=red, style="bold"]'
            }
            if(s.name === this.endState) {
              props = '[color=forestgreen, style="bold"]'
            }

            return `${s.name} ${props};\n`
          }).join('')
          let connections = this.connections.map(c => {
            let props = {}
            if(!c.userChangeble) {
              props.style = "dashed"
            }
            if(_.get(c, 'notify', false)) {
              props.color = "goldenrod"
            }
            if(_.get(c, 'name', false)) {
              props.label = `${c.name}`
              props.labeldistance = "0"
              // props.minlen = "2" // working
              // props.labelhref = "http://www.google.com" // working
            }
            const propsStr = _.map(props, (v,k) => `${k}="${v}"`).join(',')
            return `${c.from} -> ${c.to} [${propsStr}];\n`
          }).join('')
          let graphDef = `digraph g{ graph [fontname = "helvetica"]; node [fontname = "helvetica"]; edge [fontname = "helvetica"]; ${states} \n ${connections} }`

          console.info(graphDef)

          let viz = new Viz({ Module, render });
          const result = await viz.renderString(graphDef)
          this.graph = result
          this.graphValid = true
        } catch (e) {
          console.error(e)
          this.graphValid = false
        }
      },
      addState() {
        this.states.push({
          name: this.newState.name
        })

        if (this.states.length == 1) {
          this.startState = this.newState.name
        }

        this.newState = {}

        this.update()
      },
      addConnection() {
        this.connections.push({
          from: this.newConnection.from,
          to: this.newConnection.to,
          name: this.newConnection.name,
          userChangeble: true,
        })
        this.newConnection = {}
        this.update()
      },
    }
}
</script>

<style>
.state-editor {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  margin: 20px auto;
  width: 95vw;
  grid-column-gap: 15px;
  grid-row-gap: 15px;
}
.start {
  color: red;
  border-color: red;
}
.end {
  color: green;
  border-color: green;
}
</style>
