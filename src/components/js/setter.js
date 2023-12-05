import definition from '../json/definition.json'
import guidlines from '../json/guidlines.json'
import careers from '../json/careers.json'

import { createKeysByType } from './keys.js'
import {
  openGuidelineDialog,
  openPersonalDataDialog,
  openCareerDialog,
  openGrowthValueDialog
} from './dialog.js'
import { createGrowthText } from './growthText.js'

const abilityKeys = createKeysByType(definition, 'abilityValues')
const guidelineKeys = createKeysByType(definition, 'guideline')
const careerKeys = createKeysByType(definition, 'career')

export function setPcData(pcData) {
  
  resetNormalSkillValueInCareers(pcData)

  setAbilityValues(pcData)
  setNormalSkills(pcData)
  setSpecialSkills(pcData)
  setLevelValues(pcData)
  setSubAbilityValues(pcData)
  setPersonalAbilitys(pcData)
}

function getMoralePoint(pcData){
  const psychic = pcData.value.abilityValues.psychic.value
  return 16 + Math.floor(psychic/5)
}
function geLifePoint(pcData){
  const physical = pcData.value.abilityValues.physical.value
  return 16 + Math.floor(physical/5)
}

function setSubAbilityValues(pcData) {
  /**
   * 副能力値の計算
   * 
   * lifePointObj のオブジェクトキーが "LifePoint" になってるバージョンがあるので無理くり補正
   * 
   * 能力値を基準にするので、能力値集計後に計算
   * 特技で補正がかかるので、特技集計後に計算
   */
  if(pcData.value.subAbilityValues.LifePoint){
    /**
     * ここに来るのは、 lifePointObj のオブジェクトキーが "LifePoint" になってるバージョンで作ったデータ
     */
    pcData.value.subAbilityValues.lifePoint = pcData.value.subAbilityValues.LifePoint
    delete pcData.value.subAbilityValues.LifePoint
  }

  const lifePointObj = pcData.value.subAbilityValues.lifePoint
  const moralePointObj = pcData.value.subAbilityValues.moralePoint
  let lifePoint = geLifePoint(pcData)
  let moralePoint = getMoralePoint(pcData)
/** 暫定削除
  const specialSkills = pcData.value.specialSkills
  const keys = Object.keys(specialSkills)
  for(let index=0;index < keys.length;index++){
    const key = specialSkills[index]
    const correction = specialSkills[key].correction
    if(correction){
      const subAbilityValues = correction.subAbilityValues
      if(subAbilityValues){
        if(subAbilityValues.LifePoint){
          lifePoint += subAbilityValues.LifePoint.value
        }
        if(subAbilityValues.moralePoint){
          lifePoint += subAbilityValues.LifePoint.value
        }
      }
    }
  }
  **/
  lifePointObj.value = lifePoint
  moralePointObj.value = moralePoint

}

export async function setPersonalDataValue(key, pcData, $q) {
  const data = await openPersonalDataDialog(key, $q)
  pcData.value.personalData[key].value = data
}

export async function setGuidelinesKey(key, pcData, $q) {
  const data = await openGuidelineDialog(key, $q)
  const label = guidlines[key][data].label
  const abilityValues = guidlines[key][data].abilityValues
  const commandSkill = guidlines[key][data].commandSkill
  const explanation = createExplanation(guidlines[key][data], pcData)
  pcData.value.guidelines[key].guideline.key = data
  pcData.value.guidelines[key].guideline.label = label
  pcData.value.guidelines[key].guideline.explanation = explanation
  pcData.value.guidelines[key].guideline.abilityValues = abilityValues
  pcData.value.guidelines[key].guideline.commandSkill = commandSkill
  setPcData(pcData)
}

export async function setCareersKey(key, pcData, $q) {
  const data = await openCareerDialog(key, $q)
  if (data == null) {
    deleteCareer(pcData, key)
    setPcData(pcData)
    return
  }
  const label = careers[data].label
  const abilityValues = careers[data].abilityValues
  const normalSkills = careers[data].normalSkills
  const explanation = createExplanation(careers[data], pcData)
  pcData.value.careers[key].career.key = data
  pcData.value.careers[key].career.label = label
  pcData.value.careers[key].career.explanation = explanation
  pcData.value.careers[key].career.abilityValues = abilityValues
  pcData.value.careers[key].career.normalSkills = normalSkills
  setPcData(pcData)
}

function resetNormalSkillValueInCareers(pcData){
  const proficiencyLevel = getProficiencyLevel(pcData)
  const initialValue = getNormalSkillInitialValue(proficiencyLevel)
  const careerKeys = Object.keys(pcData.value.careers)
  for(let index=0;index<careerKeys.length;index++){
    const careerKey = careerKeys[index]
    const careerObj = pcData.value.careers[careerKey]
    const normalSkillsObj = careerObj.career.normalSkills
    if(normalSkillsObj){
      const skillKeys = Object.keys(normalSkillsObj)      
      for(let skillIndex=0;skillIndex<skillKeys.length;skillIndex++){
        const skillKey = skillKeys[skillIndex]
        const skillObj = normalSkillsObj[skillKey]
        if(skillObj){
          skillObj.value = initialValue
        }
      }
    }
  }
}

function addNextGrowthValues(growthTypekey, pcData) {
  /**
   * 指定された成長種別の成長情報の数を取得し、
   * その数を文字列化した値をキー値として
   * 通常成長 normalGrowthValues と 覚醒成長 newTypeGrowthValues に
   * 新しい成長情報を追加する
   * なお、ラベルは<{その時の成長情報の数}+1> + '回目'とする
   */
  const growthValues = pcData.value.growthValues[growthTypekey].values
  const growthValueKeys = Object.keys(growthValues)
  const nextKey = growthValueKeys.length.toString(10)
  const label = (growthValueKeys.length + 1).toString(10) + '回目'
  const nextItem = {
    label: label,
    explanation: null,
    values: {
      abilityValues: {},
      normalSkills: {},
      levelValues: {},
      personalAbilityDices: {},
      subAbilityValues: {},
      specialSkills: {}
    }
  }
  pcData.value.growthValues.normalGrowthValues.values[nextKey] = nextItem
  pcData.value.growthValues.newTypeGrowthValues.values[nextKey] = nextItem
}

function getIsLastGrowthValues(growthValueskey, growthTypeKey, pcData) {
  let isValidType = false
  if (growthTypeKey == 'normalGrowthValues') {
    isValidType = true
  }
  if (growthTypeKey == 'newTypeGrowthValues') {
    isValidType = true
  }
  if (isValidType == true) {
    const growthValueKeyCastAndAddOne = parseInt(growthValueskey, 10) + 1
    const growthValues = pcData.value.growthValues[growthTypeKey].values
    const growthValueKeys = Object.keys(growthValues)
    if (growthValueKeys.length == growthValueKeyCastAndAddOne) {
      return true
    }
  }
  return false
}

export async function setGrowthValueKey(key, pcData, $q, growthItemValues, growthValueKey) {
  /**
   * 成長情報にデータを格納する。
   * 格納した際、自分が 通常成長 normalGrowthValues か 覚醒成長 newTypeGrowthValues であり、
   * key値を数値化した時、その値に+1した値がkeyの個数と等しかった場合、次の成長情報の枠を追加する。
   */
  const explanationText = growthItemValues.value.explanation
  const data = await openGrowthValueDialog($q, explanationText, growthValueKey)
  const isLastGrowthValues = getIsLastGrowthValues(key, growthValueKey, pcData)
  if (isLastGrowthValues) {
    addNextGrowthValues(growthValueKey, pcData)
  }

  /**
   * 成長情報には、能力、技能、特技、PAD値、レベル値があるので、それぞれについて当該のPC情報へ格納する
   */
  const valueKeys = ['abilityValues', 'normalSkills', 'specialSkills','personalAbilityDices', 'levelValues']
  for (let index = 0; index < valueKeys.length; index++) {
    const valueKey = valueKeys[index]
    pcData.value.growthValues[growthValueKey].values[key].values[valueKey] = getValuesOnGrowthValue(
      growthItemValues,
      definition,
      valueKey
    )
  }

  /**
   * 表示用情報を格納する
   */
  pcData.value.growthValues[growthValueKey].values[key]['explanation'] = data
  setPcData(pcData)
}

function getValuesOnGrowthValue(growthItemValues, definition, valueKey) {
  const targetValueKeys = createKeysByType(definition, valueKey)
  const values = {}
  for (let index = 0; index < targetValueKeys.length; index++) {
    const key = targetValueKeys[index]
    let value = growthItemValues.value.values[key]
    if (value) {
      let intValue=value
      if (typeof value != 'number') {
        intValue = parseInt(value, 10)
        if (isNaN(value)) {
          intValue = 0
        }
      }
      const label = definition[key].label
      
      switch(valueKey){
        case 'abilityValues':
        case 'normalSkills':
        case 'levelValues':
          values[key] = {
            label: label,
            value: intValue
          }
          break

        case 'specialSkills':
          values[key] = definition[key]
          break

        case 'personalAbilityDices':
          values[value] = {
            label:value,
            personalAbility: definition[key]
          }
          values[value].personalAbility.key=key
          break
      }
    }
  }
  return values
}

function deleteItems(items) {
  const keys = Object.keys(items)
  for (let index = 0; index < keys.length; index++) {
    delete items[keys[index]]
  }
}

function getNormalSkillInitialValue(proficiencyLevel) {
  if (proficiencyLevel > 3) {
    return proficiencyLevel
  }
  return 3
}

function unlessNormalSkillKeyInNrmalSkills(normalSkillkey, normalSkills) {
  if (normalSkillkey in normalSkills) {
    return false
  }
  return true
}

function getNormalSkillValue(normalSkill, initialValue) {
  const value = normalSkill.value
  if (value == 0) {
    normalSkill.value = initialValue
    return initialValue
  }
  return value
}


function setPersonalAbilitys(pcData){
  /**
   * PADは成長でしか取得しない (初期加算や成長時の熟練など)
   * そのため、成長のデータしかみない
   *
   * PCデータ中におけるPADの情報の格納位置: pcData.value.personalAbilityDices
   * PCデータの成長データにおけるPADの情報の格納位置:
   *      pcData.value.growthValues.initialGrowthValues.values[n].values.personalAbilityDices
   *      pcData.value.growthValues.normalGrowthValues.values[n].values.personalAbilityDices
   *      pcData.value.growthValues.newTypeGrowthValues.values[n].values.personalAbilityDices
   */

  const targetKey = 'personalAbilityDices'
  setValueFromGrowth(pcData,targetKey)
  /**
   * pcData.value.personalAbilityDices 以下に "1" ~ "6" の間で存在しなキーがあれば作成
   */
  const pads = pcData.value.personalAbilityDices
  const padKeys = ["1","2","3","4","5","6"]
  padKeys.forEach(function(padKey){
    if(exsitKey(pads,padKey)==false){
      pads[padKey]={
        label: padKey,
        personalAbility: {
          key: null,
          label: null,
          explanation: null
        }
      }
    }
  })
}

function exsitKey(items,key){
  if(items[key]){
    return true
  }
  return false
}

function setSpecialSkills(pcData) {
  /**
   * 特技は成長でしか取得しない (初期加算や成長時の熟練など)
   * そのため、成長のデータしかみない
   *
   * PCデータ中における特技の情報の格納位置: pcData.value.specialSkills
   * PCデータの成長データにおける特技の情報の格納位置:
   *      pcData.value.growthValues.initialGrowthValues.values[n].values.specialSkills
   *      pcData.value.growthValues.normalGrowthValues.values[n].values.specialSkills
   *      pcData.value.growthValues.newTypeGrowthValues.values[n].values.specialSkills
   */

  const targetKey = 'specialSkills'
  setValueFromGrowth(pcData,targetKey)
}

function setValueFromGrowth(pcData,targetKey) {
  /**
   * 初期化
   */
  const targetValues = pcData.value[targetKey]
  deleteItems(targetValues)

  /**
   * 全ての成長種別に関して繰り返し
   */
  const growthTypeKeys = createKeysByType(definition, 'growthValues')
  for (let growthTypeIndex = 0; growthTypeIndex < growthTypeKeys.length; growthTypeIndex++) {
    const growthTypeKey = growthTypeKeys[growthTypeIndex]
    const growthTypeObj = pcData.value.growthValues[growthTypeKey]
    const valuesInGrowthObj = growthTypeObj.values
    const valuesInGrowthKeys = Object.keys(valuesInGrowthObj)

    /**
     * 成長種別そろぞれの、values内の成長データに関して繰り返し
     */
    for (let valuesIndex = 0; valuesIndex < valuesInGrowthKeys.length; valuesIndex++) {
      /**
       * それぞれの成長情報オブジェクトの中に キー"values" があり、さらにその中に キー"specialSkill"がある
       */
      const valuesInGrowthKey = valuesInGrowthKeys[valuesIndex]
      const growthValuesObj = growthTypeObj.values[valuesInGrowthKey].values
      const growthValues = growthValuesObj[targetKey]
      const keys = Object.keys(growthValues)
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        const growthValueObj = growthValues[key]
        switch(targetKey){
          case 'specialSkills':
            /**
             * specialSkills に 有効な key値があれば、定義されているか確認し、
             * 定義されていればPCデータ中における特技の情報として格納する
             * valueは見ない
             */
            if (definition[key]) {
              targetValues[key] = definition[key]
            }
            break

          case 'personalAbilityDices':
            /**
             * personalAbility などに 有効な key値があれば、定義されているか確認し、
             * 定義されていればPCデータ中におけるPADの情報として格納する
             * valueは見ない
             */
            if (definition[growthValueObj.personalAbility.key]) {
              targetValues[key]={
                label:key,
                personalAbility :definition[growthValueObj.personalAbility.key]
              }
              targetValues[key].personalAbility['key']=growthValueObj.personalAbility.key
            }
            break

          default:
            break
        }
      }
    }
  }
}

function setNormalSkills(pcData) {
  deleteItems(pcData.value.normalSkills)

  const proficiencyLevel = getProficiencyLevel(pcData)
  const initialValue = getNormalSkillInitialValue(proficiencyLevel)

  /**
   * 各 経歴からの技能の練度を合計
   */
  for (let careerIndex = 0; careerIndex < careerKeys.length; careerIndex++) {
    const careerKey = careerKeys[careerIndex]
    const careers = pcData.value.careers
    if (careers[careerKey]) {
      const career = pcData.value.careers[careerKey].career
      if (career.normalSkills) {
        const normalSkillkeys = Object.keys(career.normalSkills)
        for (
          let normalSkillIndex = 0;
          normalSkillIndex < normalSkillkeys.length;
          normalSkillIndex++
        ) {
          const normalSkillkey = normalSkillkeys[normalSkillIndex]
          const value = getNormalSkillValue(career.normalSkills[normalSkillkey], initialValue)
          if (unlessNormalSkillKeyInNrmalSkills(normalSkillkey, pcData.value.normalSkills)) {
            pcData.value.normalSkills[normalSkillkey] = {
              label: career.normalSkills[normalSkillkey].label,
              value: 0,
              upperLimit: null
            }
          }
          pcData.value.normalSkills[normalSkillkey].value += value
        }
      }
    }
  }

  /**
   * 各 成長からの技能の練度を合計
   */
  const normalSkillKeys = createKeysByType(definition, 'normalSkills')
  for (let normalSkillIndex = 0; normalSkillIndex < normalSkillKeys.length; normalSkillIndex++) {
    const normalSkillKey = normalSkillKeys[normalSkillIndex]
    if (!pcData.value.normalSkills[normalSkillKey]) {
      pcData.value.normalSkills[normalSkillKey] = {
        label: definition[normalSkillKey].label,
        value: 0,
        upperLimit: null
      }
    }
    const pcDataTarget = pcData.value.normalSkills[normalSkillKey]
    addValueByGrowthValues(pcData, pcDataTarget, normalSkillKey, 'normalSkills')

    /**
     * 能力値の変換値を設定
     */
    setNormalSkillUpperLimit(pcData, normalSkillKey)
  }
}

function setNormalSkillUpperLimit(pcData, key){
  /**
   * 技能の変換上限を設定
   * key に現在処理中の技能を表すキー値が入る
   * セットするデータは以下
   * pcData.value.normalSkills[key].label: 技能の表示名(技能名)
   * pcData.value.normalSkills[key].value: 技能の数値(技能練度)
   * pcData.value.normalSkills[key].upperLimit 技能練度から得られる変換上限値
   */
  const normalSkillValue = pcData.value.normalSkills[key]
  normalSkillValue.upperLimit = getNormalSkillUpperLimit(normalSkillValue.value)
}

function getSortieLevelByProficiencyLevel(proficiencyLevel){
  switch(proficiencyLevel){
    case 1:
      return 1
      
    case 2:
      return 3
      
    case 3:
      return 6

    case 4:
      return 10

    case 5:
      return 15

    case 6:
      return 21

    case 7:
      return 28
  }
}

function getPilotLevelBySortieLevel(sortieLevel){
  if(sortieLevel >= 121){
    return 16
  }
  if(sortieLevel >= 106){
    return 15
  }
  if(sortieLevel >= 92){
    return 14
  }
  if(sortieLevel >= 79){
    return 13
  }
  if(sortieLevel >= 67){
    return 12
  }
  if(sortieLevel >= 56){
    return 11
  }
  if(sortieLevel >= 46){
    return 10
  }
  if(sortieLevel >= 37){
    return 9
  }
  if(sortieLevel >= 29){
    return 8
  }
  if(sortieLevel >= 22){
    return 7
  }
  if(sortieLevel >= 16){
    return 6
  }
  if(sortieLevel >= 11){
    return 5
  }
  if(sortieLevel >= 7){
    return 4
  }
  if(sortieLevel >= 4){
    return 3
  }
  if(sortieLevel >= 2){
    return 2
  }
  if(sortieLevel >= 1){
    return 1
  }
  return 0
}


function setLevelValuesInPcData(pcData, targetKey) {
  /**
   * 熟練度の計算値の初期化
   * 計算後は 熟練度を pcData.value に代入する
   */
  let targetValue = 0
  const baseValue = {
    proficiencyLevel: 0,
    sortieLevel: 0,
    pilotLevel: 0
  }

  /**
   * 経歴の数で熟練度を算出。
   * 経歴の数は、 pcData.value.career.*.career.key が nullでない数で計算する。
   */
  const careers = pcData.value.careers
  for (let index = 0; index < careerKeys.length; index++) {
    const careerKey = careerKeys[index]
    if (careers[careerKey].career.key != null) {
      baseValue.proficiencyLevel++
    }
  }
  baseValue.  sortieLevel = getSortieLevelByProficiencyLevel(baseValue.proficiencyLevel)
  baseValue.pilotLevel = getPilotLevelBySortieLevel(baseValue.sortieLevel)
  targetValue = baseValue[targetKey]


  /**
   * 成長の levelValues 内に targetKey を含むものがあれば加算
   */
  const growthValues = pcData.value.growthValues
  const growthValueKeys = Object.keys(growthValues)
  for (let index = 0; index < growthValueKeys.length; index++) {
    const growthValueKey = growthValueKeys[index]
    const values = growthValues[growthValueKey].values
    const valueKeys = Object.keys(values)
    for (let valuesIndex = 0; valuesIndex < valueKeys.length; valuesIndex++) {
      const valueKey = valueKeys[valuesIndex]
      if (values[valueKey].values.levelValues != null) {
        if (values[valueKey].values.levelValues[targetKey] != null) {
          targetValue+=values[valueKey].values.levelValues[targetKey].value
        }
      }
    }
  }
  pcData.value.levelValues[targetKey].value = targetValue
}

function setLevelValues(pcData) {
  /**
   * 熟練度やパイロットレベルなどを計算し、設定する
   *
   * いまはパイロットレベルは設定しない
   *
   * かならず、 setNormalSkills() を 呼ぶ前に setLevelValues() を呼ぶ。
   * 熟練度を計算しておかないと、技能値の初期値を正しく計算できないため
   */
  setLevelValuesInPcData(pcData, 'proficiencyLevel')
  setLevelValuesInPcData(pcData, 'sortieLevel')
  setLevelValuesInPcData(pcData, 'pilotLevel')
}

function setAbilityValues(pcData) {
  /**
   * 各能力に関して繰り返し
   * 
   * abilityKey に現在処理中の能力を表すキー値が入る
   * 
   * セットするデータは以下
   * pcData.value.abilityValues[abilityKey].label: 能力の表示名(能力名)
   * pcData.value.abilityValues[abilityKey].value: 能力の数値(能力練度)
   * pcData.value.abilityValues[abilityKey].correction 能力から得られる変換値
   * 
   */
  for (let abilityIndex = 0; abilityIndex < abilityKeys.length; abilityIndex++) {
    const abilityKey = abilityKeys[abilityIndex]
    const pcDataAbility = pcData.value.abilityValues[abilityKey]
    pcDataAbility.value = 0

    /**
     * 指針に関する能力の合計
     */
    for (let guidlineIndex = 0; guidlineIndex < guidelineKeys.length; guidlineIndex++) {
      const guidelineKey = guidelineKeys[guidlineIndex]
      const guidelines = pcData.value.guidelines
      if (guidelines[guidelineKey]) {
        const abilityValues = pcData.value.guidelines[guidelineKey].guideline.abilityValues
        if (abilityValues[abilityKey]) {
          pcDataAbility.value += abilityValues[abilityKey].value
        }
      }
    }

    /**
     * 経歴に関する能力の合計
     */
    for (let careerIndex = 0; careerIndex < careerKeys.length; careerIndex++) {
      const careerKey = careerKeys[careerIndex]
      const careers = pcData.value.careers
      if (careers[careerKey]) {
        const career = pcData.value.careers[careerKey].career
        if (career.abilityValues[abilityKey]) {
          pcDataAbility.value += career.abilityValues[abilityKey].value
        }
      }
    }

    /**
     * 成長に関する能力の合計
     */
    const growthKey = 'abilityValues'
    const pcDataTarget = pcDataAbility
    addValueByGrowthValues(pcData, pcDataTarget, abilityKey, growthKey)

    /**
     * 能力値の変換値を設定
     */
    setCorrectionInAbilityValues(pcData, abilityKey)
  }
}

function getAbilityCorrection(value){
  if(value >= 100){
    return '1,2,3->6'
  }
  if(value >= 81){
    return '1,2->6'
  }
  if(value >= 64){
    return '1,2->5'
  }
  if(value >= 49){
    return '1,2->4'
  }
  if(value >= 36){
    return '1->5'
  }
  if(value >= 25){
    return '1->4'
  }
  if(value >= 16){
    return '1->3'
  }
  if(value >= 9){
    return '1->2'
  }
  if(value >= 4){
    return '-'
  }
  if(value >= 1){
    return '6->5'
  }
  return '6->4'
}

function getNormalSkillUpperLimit(value){
  if(value >= 28){
    return '1,2,3->6'
  }
  if(value >= 24){
    return '1,2->6'
  }
  if(value >= 20){
    return '1,2->5'
  }
  if(value >= 16){
    return '1,2->4'
  }
  if(value >= 12){
    return '1->5'
  }
  if(value >= 9){
    return '1->4'
  }
  if(value >= 6){
    return '1->3'
  }
  if(value >= 4){
    return '1->2'
  }
  if(value >= 2){
    return '-'
  }
  if(value >= 1){
    return '6->5'
  }
  return '6->4'
}

function setCorrectionInAbilityValues(pcData, abilityKey){
  /**
   * 能力値の変換値を設定
   * abilityKey に現在処理中の能力を表すキー値が入る
   * セットするデータは以下
   * pcData.value.abilityValues[abilityKey].label: 能力の表示名(能力名)
   * pcData.value.abilityValues[abilityKey].value: 能力の数値(能力練度)
   * pcData.value.abilityValues[abilityKey].correction 能力から得られる変換値
   */
  const abilityValue = pcData.value.abilityValues[abilityKey]
  abilityValue.correction = getAbilityCorrection(abilityValue.value)
}

function addValueByGrowthValues(pcData, pcDataTarget, targetKey, growthKey) {
  const growthValuesKeys = Object.keys(pcData.value.growthValues)
  for (
    let growthValuesIndex = 0;
    growthValuesIndex < growthValuesKeys.length;
    growthValuesIndex++
  ) {
    const growthValueskey = growthValuesKeys[growthValuesIndex]
    const growthValuesItems = pcData.value.growthValues[growthValueskey].values
    const itemKeys = Object.keys(growthValuesItems)
    for (let itemIndex = 0; itemIndex < itemKeys.length; itemIndex++) {
      const itemKey = itemKeys[itemIndex]
      const item = pcData.value.growthValues[growthValueskey].values[itemKey]
      if (item.values[growthKey][targetKey]) {
        pcDataTarget.value += item.values[growthKey][targetKey].value
      }
    }
  }
}

function getProficiencyLevel(pcData) {
  return pcData.value.levelValues.proficiencyLevel.value
}

function getValueInSubExplanation(value, typeKey, proficiencyLevel) {
  if (typeKey == 'normalSkills') {
    return getNormalSkillInitialValue(proficiencyLevel)
  }
  return value
}

function createSubExplanation(item, pcData) {
  let explanations = []
  const keys = Object.keys(item)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const subItem = item[key]
    const label = subItem.label
    const typeLabel = definition[key].type.label
    const typeKey = definition[key].type.key
    const proficiencyLevel = getProficiencyLevel(pcData)
    const value = getValueInSubExplanation(subItem.value, typeKey, proficiencyLevel)
    explanations.push(createGrowthText(typeLabel, label, value))
  }
  return explanations
}

function createExplanation(item, pcData) {
  let explanations = []
  const keys = Object.keys(item)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const subItem = item[key]
    switch (key) {
      case 'abilityValues':
      case 'normalSkills':
      case 'specialSkills':
        explanations = explanations.concat(createSubExplanation(subItem, pcData))
        break

      default:
        break
    }
  }
  return explanations.join(',')
}

function deleteCareer(pcData, key) {
  pcData.value.careers[key].career.key = null
  pcData.value.careers[key].career.label = null
  pcData.value.careers[key].career.explanation = null
  pcData.value.careers[key].career.abilityValues = {}
  pcData.value.careers[key].career.normalSkills = {}
  pcData.value.careers[key].career.specialSkills = {}
}
