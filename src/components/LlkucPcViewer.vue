<script setup>
import { ref } from "vue"
import { useClipboard } from '@vueuse/core'
import { useQuasar } from "quasar"
import { setPersonalDataValue, setGuidelinesKey, setCareersKey, setGrowthValueKey, setPcData } from './js/setter.js'
import { createKeysByType } from './js/keys.js'
import { openGetDataDialog, openPutDataDialog, openChatPalletDaialog } from './js/dialog.js'
import { initText, setTextExplanation } from './js/growthText.js'

import pcJson from './json/pc.json'
import definition from './json/definition.json'
import careers from './json/careers.json'
import guidelines from './json/guidlines.json'

function getRows(items) {
    const keys = Object.keys(items)
    const columns = []
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        const item = items[key]
        const newItem = {
            name: item.label
        }
        const abilityValueKeys = Object.keys(item.abilityValues)
        for (let abilityValueIndex = 0; abilityValueIndex < abilityValueKeys.length; abilityValueIndex++) {
            const abilityValueKey = abilityValueKeys[abilityValueIndex]
            newItem[abilityValueKey] = item.abilityValues[abilityValueKey].value
        }
        if (item.normalSkills) {
            const normalSkillKeys = Object.keys(item.normalSkills)
            const normalSkillLabel = ['skill-1', 'skill-2']
            for (let normalSkillIndex = 0; normalSkillIndex < normalSkillKeys.length; normalSkillIndex++) {
                const normalSkillKey = normalSkillKeys[normalSkillIndex]
                newItem[normalSkillLabel[normalSkillIndex]] = item.normalSkills[normalSkillKey].label
            }
        }
        if (item.commandSkill) {
            newItem['commandSkillLabel'] = item.commandSkill.label
            newItem['commandSkillExplanation'] = item.commandSkill.explanation
        }
        columns.push(newItem)
    }
    return columns
}

const careerColumns = ref([
    { name: 'name', label: '経歴名', field: 'name' },
    { name: 'motion', label: '運動', sortable: true, field: 'motion' },
    { name: 'Technique', label: '技量', sortable: true, field: 'Technique' },
    { name: 'reflexes', label: '反応', sortable: true, field: 'reflexes' },
    { name: 'physical', label: '体力', sortable: true, field: 'physical' },
    { name: 'intelligence', label: '知力', sortable: true, field: 'intelligence' },
    { name: 'psychic', label: '感応', sortable: true, field: 'psychic' },
    { name: 'skill-1', label: '技能-1', sortable: true, field: 'skill-1' },
    { name: 'skill-2', label: '技能-2', sortable: true, field: 'skill-2' }
])

const guidelineColumns = ref([
    { name: 'name', label: '経歴名', field: 'name' },
    { name: 'motion', label: '運動', sortable: true, field: 'motion' },
    { name: 'Technique', label: '技量', sortable: true, field: 'Technique' },
    { name: 'reflexes', label: '反応', sortable: true, field: 'reflexes' },
    { name: 'physical', label: '体力', sortable: true, field: 'physical' },
    { name: 'intelligence', label: '知力', sortable: true, field: 'intelligence' },
    { name: 'psychic', label: '感応', sortable: true, field: 'psychic' },
    { name: 'commandSkillLabel', label: '指揮特技', sortable: true, field: 'commandSkillLabel' },
    { name: 'commandSkillExplanation', label: '説明', sortable: true, field: 'commandSkillExplanation' }
])

const careerRows = ref(getRows(careers))
const firstGuidelineRow = ref(getRows(guidelines.firstGuideline))
const secondGuidelineRow = ref(getRows(guidelines.secondGuideline))

const pcData = ref(pcJson)
const tab = ref('create')

const growthItemValues = ref({
    explanation: '',
    values: {}
})
const { copy } = useClipboard()

const abilityKeys = createKeysByType(definition, 'abilityValues')
const normalSkillKeys = createKeysByType(definition, 'normalSkills')
const specialSkillKeys = createKeysByType(definition, 'specialSkills')
const levelValueKeys = createKeysByType(definition, 'levelValues')
const personalAbilityKeys = createKeysByType(definition, 'personalAbilityDices')
const growthValueKeys = createKeysByType(definition, 'growthValues')
const growthkeysArray = [abilityKeys, normalSkillKeys, specialSkillKeys, levelValueKeys, personalAbilityKeys]
initText(growthItemValues, growthkeysArray)
setPcData(pcData)

const $q = useQuasar()


function getChatPallet(pcData) {
    const chatPallet = {
        kind: 'character',
        data: {
            name: pcData.value.personalData.name.value,
            externalUrl: '',
            iconUrl: '',
            color: "#FF0066",
            secret: false,
            commands: 'commands',
            memo: 'memo',
            status: [
                {
                    label: 'LP',
                    value: pcData.value.subAbilityValues.lifePoint.value,
                    max: pcData.value.subAbilityValues.lifePoint.value
                }
            ],
            params: [
                {
                    label: '運動',
                    value: pcData.value.abilityValues.motion.value + '(' + pcData.value.abilityValues.motion.correction + ')'
                }
            ]
        }
    }
    return JSON.stringify(chatPallet)
}

function getDataByButton() {
    const text = JSON.stringify(pcData.value)
    copy(text)
    openGetDataDialog(text, $q)
}

function showChatPallet() {
    const text = getChatPallet(pcData)
    copy(text)
    openChatPalletDaialog(text, $q)
}

async function putDataByButton() {
    const data = await openPutDataDialog($q)
    pcData.value = JSON.parse(data)
}

function setPersonalData(key) {
    setPersonalDataValue(key, pcData, $q)
}

function setGuidelines(key) {
    setGuidelinesKey(key, pcData, $q)
}

function setCareers(key) {
    setCareersKey(key, pcData, $q)
}

function setGrowthValues(key, growthValueKey) {
    setGrowthValueKey(key, pcData, $q, growthItemValues, growthValueKey)
}

function setTextExplanationByChange() {
    setTextExplanation(growthItemValues, definition)
}

function initTextByButton() {
    initText(growthItemValues, growthkeysArray)
}

</script>

<template>
    <q-toolbar class="bg-primary text-white">
        LLKUC PC作成表示アプリ(プロト版)
        <q-space />
        <q-btn class="bg-cyan-2 text-indigo-14" label="パレット出力" v-on:click="showChatPallet" />
        <q-btn class="bg-cyan-2 text-indigo-14" label="情報出力" v-on:click="getDataByButton" />
        <q-btn class="bg-cyan-2 text-indigo-14" label="情報入力" v-on:click="putDataByButton" />
    </q-toolbar>
    <q-tabs v-model="tab" class="text-teal">
        <q-tab name="create" label="キャラクタ作成" />
        <q-tab name="firstGuidelineList" label="第一指針リスト" />
        <q-tab name="secondGuidelineList" label="第二指針リスト" />
        <q-tab name="careerList" label="経歴リスト" />
    </q-tabs>
    <q-tab-panels v-model="tab">
        <q-tab-panel name="create">
            <div class="q-pa-md">
                <div class="row">
                    <div class="col col-9">
                        <div class="row">
                            <div class="col">
                                <div class="row table-header">
                                    <div class="col">項目名</div>
                                    <div class="col">値</div>
                                </div>
                                <div class="row table-body" v-for="(item, index) in pcData.personalData"
                                    v-bind:key="item.label">
                                    <div class="col first-col">{{ item.label }}</div>
                                    <div class="col crilable-col" v-on:dblclick="setPersonalData(index)">{{ item.value }}
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div class="row table-header">
                                    <div class="col">レベル名</div>
                                    <div class="col">数値</div>
                                </div>
                                <div class="row table-body" v-for="item in pcData.levelValues" v-bind:key="item.label">
                                    <div class="col first-col">{{ item.label }}</div>
                                    <div class="col text-center">{{ item.value }}</div>
                                </div>
                                <div class="row table-header">
                                    <div class="col">指針</div>
                                    <div class="col">名前</div>
                                    <div class="col">指揮特技</div>
                                </div>
                                <div class="row table-body" v-for="item in pcData.guidelines" v-bind:key="item.label">
                                    <div class="col first-col">{{ item.label }}</div>
                                    <div class="col text-center">{{ item.guideline.label }}</div>
                                    <div v-if="item.guideline.commandSkill" class="col text-center">
                                        {{ item.guideline.commandSkill.label }}
                                        <q-tooltip anchor="center right" self="center left">
                                            {{ item.guideline.commandSkill.explanation }}
                                        </q-tooltip>
                                    </div>
                                </div>
                            </div>
                            <div class="col">
                                <div class="row table-header">
                                    <div class="col">PAD</div>
                                    <div class="col">名前</div>
                                    <div class="col">効果</div>
                                </div>
                                <div class="row table-body" v-for="item in pcData.personalAbilityDices"
                                    v-bind:key="item.label">
                                    <div class="col first-col">{{ item.label }}</div>
                                    <div class="col">{{ item.personalAbility.label }}</div>
                                    <div class="col">{{ item.personalAbility.explanation }}</div>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <div class="row table-header">
                                    <div class="col">能力名</div>
                                    <div class="col">能力練度</div>
                                    <div class="col">変換値</div>
                                </div>
                                <div class="row table-body" v-for="item in pcData.abilityValues" v-bind:key="item.label">
                                    <div class="col text-center first-col">{{ item.label }}</div>
                                    <div class="col text-center">{{ item.value }}</div>
                                    <div class="col text-center">{{ item.correction }}</div>
                                </div>
                                <div class="row table-header">
                                    <div class="col">副能力名</div>
                                    <div class="col">数値</div>
                                </div>
                                <div class="row table-body" v-for="item in pcData.subAbilityValues" v-bind:key="item.label">
                                    <div class="col text-center first-col">{{ item.label }}</div>
                                    <div class="col text-center">{{ item.value }}</div>
                                </div>
                            </div>
                            <div class="col">
                                <div class="row table-header">
                                    <div class="col">特技名</div>
                                    <div class="col">効果</div>
                                </div>
                                <div class="row table-body" v-for="item in pcData.specialSkills" v-bind:key="item.label">
                                    <div class="col first-col">{{ item.label }}</div>
                                    <div class="col flex-break">
                                        <div v-for="subitem in item.effects" v-bind:key="subitem.label">
                                            {{ subitem.label }} : {{ subitem.effect.label }}
                                            <q-tooltip anchor="center right" self="center left">
                                                {{ subitem.effect.explanation }}
                                            </q-tooltip>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="row table-header">
                            <div class="col">技能名</div>
                            <div class="col">技能練度</div>
                            <div class="col">変換上限</div>
                        </div>
                        <div class="row table-body" v-for="item in pcData.normalSkills" v-bind:key="item.label">
                            <div class="col text-center first-col">{{ item.label }}</div>
                            <div class="col text-center">{{ item.value }}</div>
                            <div class="col text-center">{{ item.upperLimit }}</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="row table-header">
                            <div class="col col-2">指針順位</div>
                            <div class="col col-2">指針名</div>
                            <div class="col col-8">加算内容</div>
                        </div>
                        <div class="row table-body" v-for="(item, index) in pcData.guidelines" v-bind:key="item.label">
                            <div class="col col-2 first-col">{{ item.label }}</div>
                            <div class="col col-2 crilable-col" v-on:dblclick="setGuidelines(index)">{{ item.guideline.label
                            }}</div>
                            <div class="col col-8 crilable-col" v-on:dblclick="setGuidelines(index)">{{
                                item.guideline.explanation }}</div>
                        </div>
                        <div class="row table-header">
                            <div class="col col-2">経歴順位</div>
                            <div class="col col-2">経歴名</div>
                            <div class="col col-8">加算内容</div>
                        </div>
                        <div class="row table-body" v-for="(item, index) in pcData.careers" v-bind:key="index">
                            <div class="col col-2 first-col">{{ item.label }}</div>
                            <div class="col col-2 crilable-col" v-on:dblclick="setCareers(index)">{{ item.career.label }}
                            </div>
                            <div class="col col-8 crilable-col" v-on:dblclick="setCareers(index)">{{ item.career.explanation
                            }}</div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="row table-header">
                            <div class="col col-2">成長種別</div>
                            <div class="col col-2">成長回次</div>
                            <div class="col col-8">成長内容</div>
                        </div>
                        <div v-for="(growthValueKey, index) in growthValueKeys" v-bind:key="index">
                            <div class="row table-body" v-for="(item, index) in pcData.growthValues[growthValueKey].values"
                                v-bind:key="index">
                                <div class="col col-2 first-col">{{ pcData.growthValues[growthValueKey].label }}</div>
                                <div class="col col-2 first-col">{{ item.label }}</div>
                                <div class="col col-8 crilable-col" v-on:dblclick="setGrowthValues(index, growthValueKey)">
                                    {{ item.explanation }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="row table-header">
                            <div class="col">成長内容テキスト作成</div>
                        </div>
                        <div class="row table-body">
                            <div class="col text-center">成長内容用テキスト: {{ growthItemValues.explanation }}</div>
                            <div class="col"><q-btn class="bg-indigo-5 text-indigo-1" label="成長内容全消去"
                                    v-on:click="initTextByButton" /></div>
                        </div>
                        <div class="row table-body">
                            <div class="col" v-for="arrayItem in growthkeysArray" v-bind:key="arrayItem">
                                <div class="row" v-for="arrayKey in arrayItem" v-bind:key="arrayKey">
                                    <div class="col text-weight-thin text-caption text-right">{{ definition[arrayKey].label
                                    }}</div>
                                    <div class="col text-weight-thin text-caption">
                                        <q-input dense v-model="growthItemValues.values[arrayKey]"
                                            v-on:update:model-value="setTextExplanationByChange" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </q-tab-panel>
        <q-tab-panel name="firstGuidelineList">
            <q-table title="第一指針リスト" :rows="firstGuidelineRow" :columns="guidelineColumns" row-key="name">
            </q-table>
        </q-tab-panel>
        <q-tab-panel name="secondGuidelineList">
            <q-table title="第二指針リスト" :rows="secondGuidelineRow" :columns="guidelineColumns" row-key="name">
            </q-table>
        </q-tab-panel>
        <q-tab-panel name="careerList">
            <q-table title="経歴リスト" :rows="careerRows" :columns="careerColumns" row-key="name">
            </q-table>
        </q-tab-panel>
    </q-tab-panels>
</template>
