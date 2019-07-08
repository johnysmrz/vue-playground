<template>
  <div>
    <h2>Cz Sorter</h2>
    <table>
      <tr>
        <th v-for="c in cols" :class="{active: col === c}"
            :key="c"
            @click="col = c">{{ c }}</th>
      </tr>
      <tr v-for="w in sorted" :key="w.id">
        <td v-for="c in cols" :key="c">{{ w[c] }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import _ from 'lodash'
import sortingData from '@/assets/sorting-data'

const czSorter = (property, direction) => (a, b) => {
    if (!_.isString(a)) return -1
    if (a === null || a === undefined) return -1
    const comp = a.localeCompare(b, 'cs')
    // console.log(a,b,comp, direction)
    return comp
}

_.mixin({
    sortWith: function(arr, sorter) {
        return _.map(arr).sort(sorter)
    },
})

export default {
    name: 'CzSorter',
    data() {
        return {
            col: 'id',
        }
    },
    computed: {
        cols() {
            return ['id', 'name', 'randomNumber']
        },
        sorted() {
            const objects = _.chain(sortingData)
                .map(o => {
                    return {
                        id: o[2],
                        name: o[0],
                        randomNumber: o[1],
                        _index: {},
                    }
                })
                .value()
            // objects = _.sortWith(objects, czSorter(this.col, 'ASC'))
            return objects
        },
    // words() {
    //   const words = 'velká většina z nich se snaží vytvářet platících diváků a podvodníků se domnívá že podobné podmínky jako v jiných odvětvích nebo v politických kruzích bylo vyšlechtěno mnoho hříchů když mně nyní prokazuje radikální restrukturalizace těžkého průmyslu se k veřejnosti a poslední chvíli prodleky jsou v provozu návštěva : aktivní : 15. -18. století se podle odhadu zvýšily o 0.3 procenta, v polovině 18. století vypracovalo návrh na zahájení prací na nové odbavovací haly byly podle starého pojistného plánu vzp v roce 1996 měla být směrodatné deště způsobily v posledních dnech zaznamenala podle slov svého mluvčího vysokého komisaře kbse pro národnostní menšiny max van der stoel jest království nebeského'
    //   return _.chain(words)
    //   .split(' ')
    //   .map(w => _.trim(w))
    //   .filter(w => _.size(w) > 3)
    //   .value()
    // }
    },
}
</script>

<style>
table {
  font-family: 'Courier New', Courier, monospace;
  font-size: 10pt;
}
td {
  padding: 1px 5px
}
th {
  cursor: pointer;
}
th.active {
  color: red
}
</style>
