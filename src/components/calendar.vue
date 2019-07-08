<template>
  <div>
    <ReccuringEditor v-model="ruleData"></ReccuringEditor>
    <!-- {{ events }} -->
    <VueCal :events="events" :xsmall="true" defaultView="month"></VueCal>
  </div>
</template>

<script>
import { RRule, RRuleSet, rrulestr } from 'rrule'
import VueCal from 'vue-cal'
import moment from 'moment'
import ReccuringEditor from './recurring-editor'
import 'vue-cal/dist/vuecal.css'

moment.locale('cs')

const ruleMapper = e => {
    return {
        start: moment(e).format('YYYY-MM-DD hh:mm:ss'),
        end: moment(e).add(2, 'hours').format('YYYY-MM-DD hh:mm:ss'),
        title: 'Reccuring',
    }
}

export default {
    name: 'Calendar',
    components: {
        VueCal,
        ReccuringEditor,
    },
    data() {
        return {
            ruleData: {
                freq: RRule.WEEKLY,
                interval: 2,
                // byweekday: [RRule.MO, RRule.FR],
                dtstart: new Date(Date.UTC(2019, 5, 1, 10, 30, 0)),
                until: new Date(Date.UTC(2019, 10, 30)),
            },
        }
    },
    computed: {
        events() {
            const rule = new RRule(this.ruleData)
            // rule.count = 5
            // return rule.all().map(ruleMapper)
            // return []
            return rule.between(moment().startOf('year').subtract('month', 3).toDate(), moment().endOf('year').add('month', 3).toDate()).map(ruleMapper)
        },
    },
}
</script>

<style>
.vuecal__cell {
  height: 70px;
}
.vuecal__cell--has-events {
  background-color: lightpink;
}
</style>
