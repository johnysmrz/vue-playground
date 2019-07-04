<template>
  <div style="width: 800px; margin: 20px auto;">
    <Settings :schema="schema" v-model="settings" :defaultValue="defaultSettings"></Settings>
    <button class="btn btn-primary" @click="save()">Save</button>
  </div>
</template>

<script>
import { REG_ARRAY_OF_PATTERNS, REG_POSITIVE_INTEGER, REG_INVITE_CODE } from '../regexp-lib'

const SCHEMA = {
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "http://example.com/root.json",
  "type": "object",
  "title": "nastavení",
  "properties": {
    "gui": {
      "$id": "#/properties/gui",
      "type": "object",
      "title": "uživatelské rozhraní",
      "properties": {
        "paging": {
          "$id": "#/properties/gui/properties/paging",
          "type": "integer",
          "title": "stránkování",
          "default": 20,
          "examples": [
            0, 100, 20
          ],
          "pattern": REG_POSITIVE_INTEGER,
          "validityHint": "Musí být celé číslo vetší než 0"
        },
      }
    },
    "company": {
      "$id": "#/properties/company",
      "type": "object",
      "title": "nastavení firmy",
      "properties": {
        "userCanOverwrite": {
          "$id": "#/properties/company/properties/userCanOverwrite",
          "type": "array",
          "title": "uživatel může si upravit nastavení",
          "items": {
            "$id": "#/properties/company/properties/userCanOverwrite/items",
            "type": "string",
            "title": "The Items Schema",
            "default": "",
          },
          "pattern": REG_ARRAY_OF_PATTERNS,
          "validityHint": "Pole klíčů oddelených středníky. Pouze malé ASCII znaky a tečky. Lze použít wildcard charakter *",
          "examples": ["*", 'gui*', 'gui.*', 'gui.paging', 'gui.pag*'],
        },
        "invite": {
          "$id": "#/properties/company/properties/invite",
          "type": "object",
          "title": "pozvánky",
          "required": [
            "enabled",
            "code",
            "approve"
          ],
          "properties": {
            "enabled": {
              "$id": "#/properties/company/properties/invite/properties/enabled",
              "type": "boolean",
              "title": "zapnuto",
              "default": false,
              "examples": [
                true
              ]
            },
            "code": {
              "$id": "#/properties/company/properties/invite/properties/code",
              "type": "string",
              "title": "zvací kód",
              "default": "",
              "examples": ["12345", "Abc12", "qwertyuiop"],
              "pattern": REG_INVITE_CODE,
              "validityHint": "5 až 20 (včetně) znaků a čísel bez diakritiky a mezer.",
            },
            "approve": {
              "$id": "#/properties/company/properties/invite/properties/approve",
              "type": "boolean",
              "title": "potvrzení pozvánky",
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
    save() {
      console.info(this.settings)
    }
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
