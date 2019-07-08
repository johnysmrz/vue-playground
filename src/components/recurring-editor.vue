<template>
  <div class="rrule-editor--container">

    <div class="btn-group btn-group-sm" role="group">
      <div v-for="(v,k) in frequencies" :key="v"
           :value="v"
           :class="{active: v === rule.freq}" class="btn btn-primary"
           @click="rule.freq = v; fireInputEvent()">
        {{ $t(k) }}
      </div>
    </div>

    <div class="main-values--container">
      <label :for="`dtstart-${formId}`">Zacatek</label>
      <input :id="`dtstart-${formId}`" v-model="rule.dtstart"
             type="datetime-local"
             class="form-control" @change="fireInputEvent">

      <label :for="`interval-${formId}`">Interval</label>
      <input :id="`interval-${formId}`" v-model="rule.interval"
             type="number"
             class="form-control" @change="fireInputEvent">

      <label :for="`dtstart-${formId}`">Konec</label>
      <input :id="`until-${formId}`" v-model="rule.until"
             :disabled="untilInfinity"
             type="datetime-local" class="form-control"
             @change="fireInputEvent">

      <label :for="`until-infinity-${formId}`">Nekončí</label>
      <input :id="`until-infinity-${formId}`" v-model="untilInfinity"
             type="checkbox"
             @change="fireInputEvent" />
    </div>

    <div>
      <ul class="tabs">
        <li :class="{'active': activeTab === 1}" @click="activeTab = 1">
          Dny v mesici
          <span v-if="rule.bymonthday.length" class="indicator">({{ rule.bymonthday.length }})</span>
        </li>
        <li :class="{'active': activeTab === 2}" @click="activeTab = 2">
          Dny v tydnu
          <span v-if="rule.byweekday.length" class="indicator">({{ rule.byweekday.length }})</span>
        </li>
        <li :class="{'active': activeTab === 3}" @click="activeTab = 3">
          Mesice
          <span v-if="rule.bymonth.length" class="indicator">({{ rule.bymonth.length }})</span>
        </li>
      </ul>

      <div class="tabs-content">
        <template v-if="activeTab === 1">
          <div v-for="v in 31" :key="`day-${v}`" class="form-check form-check-inline flex-checkbox--small">
            <input :id="`bymonthday-${v}-${formId}`" v-model="rule.bymonthday"
                   :value="v"
                   class="form-check-input" type="checkbox"
                   @change="fireInputEvent">
            <label :for="`bymonthday-${v}-${formId}`" :class="{active: rule.bymonthday.includes(v)}" class="form-check-label">{{ v }}</label>
          </div>
        </template>

        <template v-if="activeTab === 2">
          <div v-for="(v,k) in days" :key="k" class="form-check form-check-inline flex-checkbox--medium">
            <input :id="`byweekday-${v}-${formId}`" v-model="rule.byweekday"
                   :value="v.weekday"
                   class="form-check-input" type="checkbox"
                   @change="fireInputEvent">
            <label :for="`byweekday-${v}-${formId}`" :class="{active: rule.byweekday.includes(v.weekday)}" class="form-check-label">{{ $t(k) }}</label>
          </div>
        </template>

        <template v-if="activeTab === 3">
          <div v-for="v in 12" :key="`month-${v}`" class="form-check form-check-inline flex-checkbox--medium">
            <input :id="`bymonth-${v}-${formId}`" v-model="rule.bymonth"
                   :value="v"
                   class="form-check-input" type="checkbox"
                   @change="fireInputEvent">
            <label :for="`bymonth-${v}-${formId}`" :class="{active: rule.bymonth.includes(v)}" class="form-check-label">{{ $t(`rrule.month.${v}`) }}</label>
          </div>
        </template>
      </div>
    </div>

    <a href="https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html">RRULE info</a>
    <div>{{ rstring }}</div>
  </div>
</template>

<script>
import { RRule, RRuleSet, rrulestr } from 'rrule'
import moment from 'moment'
import uuid from 'uuid'
import _ from 'lodash'

moment.locale('cs')

const INT_RULES = ['freq', 'interval']

const INPUT_FORMAT = 'YYYY-MM-DDThh:mm:ss'

export default {
    name: 'RecurringEditor',
    components: {

    },
    data() {
        return {
            rule: {
                freq: RRule.DAILY,
                dtstart: moment().startOf('month').format(INPUT_FORMAT),
                until: null,
                interval: 1,
                byweekday: [],
                bymonthday: [],
                bymonth: [],
            },
            untilInfinity: true,
            activeTab: 1,
        }
    },
    computed: {
        normalizedRuleData() {
            const rule = _.clone(this.rule)
            rule.interval = _.parseInt(rule.interval)
            rule.dtstart = moment(rule.dtstart).utc().toDate()
            if (rule.until !== null && !this.untilInfinity) {
                rule.until = moment(rule.until).utc().toDate()
            } else {
                rule.until = null
            }
            return rule
        },
        rstring() {
            const rule = new RRule(this.normalizedRuleData)
            return rule.toString()
        },
        frequencies() {
            return {
                'rrule.freq.yearly': RRule.YEARLY,
                'rrule.freq.monthly': RRule.MONTHLY,
                'rrule.freq.weekly': RRule.WEEKLY,
                'rrule.freq.daily': RRule.DAILY,
                'rrule.freq.hourly': RRule.HOURLY,
                'rrule.freq.minutely': RRule.MINUTELY,
                'rrule.freq.secondly': RRule.SECONDLY,
            }
        },
        days() {
            return {
                'rrule.day.monday': RRule.MO,
                'rrule.day.tuesday': RRule.TU,
                'rrule.day.wednesday': RRule.WE,
                'rrule.day.thursday': RRule.TH,
                'rrule.day.friday': RRule.FR,
                'rrule.day.saturday': RRule.SA,
                'rrule.day.sunday': RRule.SU,
            }
        },
        formId() {
            return uuid()
        },
    },
    methods: {
        fireInputEvent() {
            this.$emit('input', this.normalizedRuleData)
        },

    },
}
</script>

<style scoped>
.rrule-editor--container {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 34px 120px auto;
  width: 700px;
  justify-content: space-evenly;
  padding: 10px;
}
.main-values--container {
  display: grid;
  grid-template-columns: 1fr 3fr 1fr 3fr;
  grid-column-gap: 15px;
  grid-row-gap: 15px;
  align-content: space-evenly;
}
.tabs {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  margin: 0;
  padding: 0;
}
.tabs > li {
  list-style: none;
  padding: 3px;
  margin-right: 4px;
  border: 1px solid #e9ecef;
  border-bottom: 0;
  background-color: #e9ecef;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  cursor: pointer;
}
.tabs > li.active {
  background-color: white;
}
.tabs-content {
  border: 1px solid #e9ecef;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}
.tabs .indicator {
  color: var(--primary);
  font-weight: bold;
}
.flex-checkbox--small {
  flex-basis: 40px;
}
.flex-checkbox--medium {
  flex-basis: 80px;
}
label.active {
  color: var(--primary);
  font-weight: bold;
}
</style>
