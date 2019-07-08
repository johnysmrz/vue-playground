<template>
  <div style="width: 800px; margin: 20px auto;">
    <Settings :schema="schema"
        v-model="settings"
        :defaultValue="defaultSettings"
        @inputOverride="childOverrideChanged"
        @inputValid="childValidChanged"
    ></Settings>
    <button
        class="btn"
        :class="[formValid ? 'btn-primary' : 'btn-secondary']"
        @click="save()"
        :disabled="!formValid">Uložit</button>
  </div>
</template>

<script>
import { REG_ARRAY_OF_PATTERNS, REG_POSITIVE_INTEGER, REG_INVITE_CODE } from '../regexp-lib'

import Settings from './settings'

const SCHEMA = {
    'definitions': {},
    '$schema': 'http://json-schema.org/draft-07/schema#',
    '$id': 'http://example.com/root.json',
    'type': 'object',
    'title': 'nastavení',
    'properties': {
        'gui': {
            '$id': '#/properties/gui',
            'type': 'object',
            'title': 'Uživatelské rozhraní',
            'properties': {
                'paging': {
                    '$id': '#/properties/gui/properties/paging',
                    'type': 'integer',
                    'title': 'Stránkování',
                    'description': 'Počet záznamů ktere se budou zobrazovat ve všech přehledech.',
                    'default': 20,
                    'pattern': REG_POSITIVE_INTEGER,
                    'validityHint': 'Musí být celé číslo vetší než 10 a menší než 400.',
                    'validityIntRange': [10, 400],
                },
            },
        },
        'company': {
            '$id': '#/properties/company',
            'type': 'object',
            'title': 'nastavení firmy',
            'properties': {
                'userCanOverwrite': {
                    '$id': '#/properties/company/properties/userCanOverwrite',
                    'type': 'array',
                    'title': 'uživatel může si upravit nastavení',
                    'items': {
                        '$id': '#/properties/company/properties/userCanOverwrite/items',
                        'type': 'string',
                        'title': 'The Items Schema',
                        'default': '',
                    },
                    'pattern': REG_ARRAY_OF_PATTERNS,
                    'validityHint': 'Pole klíčů oddelených středníky. Pouze malé ASCII znaky a tečky. Lze použít wildcard charakter *',
                    'examples': ['*', 'gui*', 'gui.*', 'gui.paging', 'gui.pag*'],
                    'description': 'Toto nastavení definuje jaká nastavení si uživatel může sám měnit. Ve výchozím stavu obsahuje hodnotu * která říká že si může zmenit cokoliv.'
                },
                'invite': {
                    '$id': '#/properties/company/properties/invite',
                    'type': 'object',
                    'title': 'pozvánky',
                    'required': [
                        'enabled',
                        'code',
                        'approve',
                    ],
                    'properties': {
                        'enabled': {
                            '$id': '#/properties/company/properties/invite/properties/enabled',
                            'type': 'boolean',
                            'title': 'zapnuto',
                            'default': true,
                            'description': 'Zapne nebo vypne možnost aby se mohl uživatel přidat do firmy pomocí nastaveného kódu. Pokud tuto možnost vypnete, další nastavení z této kategorie postrádají význam.',
                        },
                        'code': {
                            '$id': '#/properties/company/properties/invite/properties/code',
                            'type': 'string',
                            'title': 'zvací kód',
                            'default': '',
                            'examples': ['12345', 'Abc12', 'qwertyuiop'],
                            'pattern': REG_INVITE_CODE,
                            'validityHint': '5 až 20 (včetně) znaků a čísel bez diakritiky a mezer.',
                            'description': 'Zvací kód který uživatel zadá pro přidání do firmy. Zvolte si tento kod dostatečně unikátní aby jej nebylo možno lehce odhadnout a zneužít',
                        },
                        'approve': {
                            '$id': '#/properties/company/properties/invite/properties/approve',
                            'type': 'boolean',
                            'title': 'potvrzení pozvánky',
                            'default': true,
                            'description': 'Pokud zapnete tuto možnost. Správce firmy bude mít možnost schválit či odmítnout pozvánky do firmy. Dokud nebude uživatel schválen tak neuvidí žádná data.',
                        },
                    },
                },
            },
        },
    },
}

const DEFAULT_SETTINGS = {
    'gui': {
        'paging': 100,
        'testText': '',
    },
    'company': {
        'userCanOverwrite': [
            '*',
        ],
        'invite': {
            'enabled': true,
            'code': '1234',
            'approve': true,
        },
    },
}

const flattenObject = ob => {
	let toReturn = {}
	for (var i in ob) {
		if (!ob.hasOwnProperty(i)) continue
		if ((typeof ob[i]) == 'object') {
			let flatObject = flattenObject(ob[i])
			for (let x in flatObject) {
				if (!flatObject.hasOwnProperty(x)) continue
				toReturn[i + '_' + x] = flatObject[x]
			}
		} else {
			toReturn[i] = ob[i]
		}
	}
	return toReturn
}

export default {
    name: 'SettingsEditor',
    components: {
        Settings,
    },
    data() {
        return {
            settings: {gui: {paging: 120}},
            override: {},
            valid: {},
        }
    },
    computed: {
        schema() {
            return SCHEMA
        },
        defaultSettings() {
            return DEFAULT_SETTINGS
        },
        formValid() {
            const flatValid = flattenObject(this.valid)
            if(_.size(flatValid) === 0) return true
            return !_.includes(flatValid, false) 
        }
    },
    methods: {
        save() {
            const flatSettings = flattenObject(this.settings)
            const flatOverride = flattenObject(this.override)
            const flatValid = flattenObject(this.valid)
            const toSave = _.pickBy(flatSettings, (v,k) => flatOverride[k] && _.get(flatValid, k, true))
            console.warn(toSave)
        },
        childOverrideChanged(e) {
          this.$set(this, 'override', e)
        },
        childValidChanged(e) {
          this.$set(this, 'valid', e)
        },
    },
}
</script>
