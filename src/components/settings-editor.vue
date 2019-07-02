<template>
  <div style="width: 800px; margin: 20px auto;">
    <div class="headding">
      <div>Nazev</div>
      <div>Systemove nastaveni</div>
      <div>Uzivatelske nastaveni</div>
    </div>
    <Settings :schema="schema" v-model="settings" :defaultValue="defaultSettings"></Settings>
  </div>
</template>

<script>
import { REG_POSITIVE_INTEGER } from '../regexp-lib'

const SCHEMA = {
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/root.json",
  "type": "object",
  "title": "The Root Schema",
  "required": [
    "gui",
    "company"
  ],
  "properties": {
    "gui": {
      "$id": "#/properties/gui",
      "type": "object",
      "title": "The Gui Schema",
      "required": [
        "paging",
        "testText"
      ],
      "properties": {
        "paging": {
          "$id": "#/properties/gui/properties/paging",
          "type": "integer",
          "title": "The Paging Schema",
          "default": 20,
          "examples": [
            0, 100, 20
          ],
          "pattern": REG_POSITIVE_INTEGER
        },
        "testText": {
          "$id": "#/properties/gui/properties/testText",
          "type": "string",
          "title": "The Testtext Schema",
          "default": "",
          "examples": [
            ""
          ],
          "pattern": REG_POSITIVE_INTEGER
        }
      }
    },
    "company": {
      "$id": "#/properties/company",
      "type": "object",
      "title": "The Company Schema",
      "required": [
        "userCanOverwrite",
        "invite"
      ],
      "properties": {
        "userCanOverwrite": {
          "$id": "#/properties/company/properties/userCanOverwrite",
          "type": "array",
          "title": "The Usercanoverwrite Schema",
          "items": {
            "$id": "#/properties/company/properties/userCanOverwrite/items",
            "type": "string",
            "title": "The Items Schema",
            "default": "",
            "examples": [
              "*"
            ],
            "pattern": "^(.*)$"
          }
        },
        "invite": {
          "$id": "#/properties/company/properties/invite",
          "type": "object",
          "title": "The Invite Schema",
          "required": [
            "enabled",
            "code",
            "approve"
          ],
          "properties": {
            "enabled": {
              "$id": "#/properties/company/properties/invite/properties/enabled",
              "type": "boolean",
              "title": "The Enabled Schema",
              "default": false,
              "examples": [
                true
              ]
            },
            "code": {
              "$id": "#/properties/company/properties/invite/properties/code",
              "type": "string",
              "title": "The Code Schema",
              "default": "",
              "examples": [
                "1234"
              ],
              "pattern": "^(.*)$"
            },
            "approve": {
              "$id": "#/properties/company/properties/invite/properties/approve",
              "type": "boolean",
              "title": "The Approve Schema",
              "default": false,
              "examples": [
                true
              ]
            }
          }
        }
      }
    }
  }
}

const DEFAULT_SETTINGS = {
    "gui": {
        "paging": 100,
        "testText": "",
    },
    "company": {
        "userCanOverwrite": [
            "*"
        ],
        "invite": {
          "enabled": true,
          "code": "1234",
          "approve": true,
        }
    }
}

import Settings from './settings'

export default {
  name: 'SettingsEditor',
  components: {
    Settings,
  },
  data() {
    return {
      settings: {"company":{"invite":{"code":"123"}},"gui":{"paging":"200"}}
    }
  },
  methods: {
    
  },
  computed: {
    schema() {
      return SCHEMA
    },
    defaultSettings() {
      return DEFAULT_SETTINGS
    },
  }
}
</script>

<style scoped>
.headding {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
}
</style>
