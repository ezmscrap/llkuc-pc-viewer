function getSpecialSkillsLabels(specialSkills) {
  const result = []
  const keys = Object.keys(specialSkills)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const label = specialSkills[key].label
    result.push(label)
  }
  return result.join(', ')
}

function getNormalSkillsLabel(normalSkills, selector) {
  const result = []
  const keys = Object.keys(normalSkills)
  let validSkills = []
  console.log(selector)
  if (typeof selector == 'object') {
    if (Array.isArray(selector)) {
      validSkills = selector
    }
  }
  console.log(validSkills)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const label = normalSkills[key].label
    const value = normalSkills[key].value
    const upperLimit = normalSkills[key].upperLimit
    if (value) {
      if (validSkills.length == 0 || validSkills.includes(key)) {
        const skillMemo = [label, ': ', value, ' (', upperLimit, ')'].join('')
        result.push(skillMemo)
      }
    }
  }
  return result.join('\n')
}

function getAbilityValuesLabels(abilityValues) {
  const result = []
  const keys = Object.keys(abilityValues)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const label = abilityValues[key].label
    const value = abilityValues[key].value
    const upperLimit = abilityValues[key].correction
    if (value) {
      const abilityValuesMemo = [label, ': ', value, ' (', upperLimit, ')'].join('')
      result.push(abilityValuesMemo)
    }
  }
  return result.join('\n')
}

function getPersonalAbilityDiceLabels(personalAbilityDices){
  const result = []
  const keys = Object.keys(personalAbilityDices)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const label = personalAbilityDices[key].personalAbility.label
    const explanation = personalAbilityDices[key].personalAbility.explanation
    const padMemo = [key, ": ",label, '[', explanation, ']' ].join('')
    result.push(padMemo)
  }
  return result.join('\n')
}

function getMemo(pcData, guidelines, specialSkills, abilityValues, normalSkills, personalAbilityDices) {
  const firstGuidelineLabel = guidelines.firstGuideline.guideline.label
  const secondGuidelineLabel = guidelines.secondGuideline.guideline.label
  const specialSkillsLabel = getSpecialSkillsLabels(specialSkills)
  const abilityValuesLabels = getAbilityValuesLabels(abilityValues)
  const normalSkillsMemosLabel = getNormalSkillsLabel(normalSkills, ['command', 'msPiloting'])
  const personalAbilityDiceLabels = getPersonalAbilityDiceLabels(personalAbilityDices)
  return [
    ['■ 指針: ', firstGuidelineLabel, '/', secondGuidelineLabel].join(''),
    ['■ 特技: ', specialSkillsLabel].join(''),
    ['■ PAD:', personalAbilityDiceLabels].join('\n'),
    ['■ 能力値:', abilityValuesLabels].join('\n'),
    ['■ 主要技能:', normalSkillsMemosLabel].join('\n')
  ].join('\n')
}

function getStatus(subAbilityValues) {
  return [
    {
      label: 'LP',
      value: subAbilityValues.lifePoint.value,
      max: subAbilityValues.lifePoint.value
    },
    {
      label: 'MP',
      value: subAbilityValues.moralePoint.value,
      max: subAbilityValues.moralePoint.value
    }
  ]
}

function getParams(abilityValues) {
  return [
    {
      label: '運動',
      value: abilityValues.motion.value + '(' + abilityValues.motion.correction + ')'
    },
    {
      label: '技量',
      value: abilityValues.technique.value + '(' + abilityValues.technique.correction + ')'
    },
    {
      label: '反応',
      value: abilityValues.reflexes.value + '(' + abilityValues.reflexes.correction + ')'
    },
    {
      label: '体力',
      value: abilityValues.physical.value + '(' + abilityValues.physical.correction + ')'
    },
    {
      label: '知力',
      value: abilityValues.intelligence.value + '(' + abilityValues.intelligence.correction + ')'
    },
    {
      label: '感応',
      value: abilityValues.psychic.value + '(' + abilityValues.psychic.correction + ')'
    }
  ]
}

function getCommand(abilityValues, normalSkills,personalAbilityDices) {
  /**
   * イニシアティブ判定 などの判定を追加する部分
   * ≪使用する能力値：使用する技能：目標値≫判定
   * イニシアティブ勝負《知力：指揮：対決》
   */
  const result = []
  const keys = Object.keys(commandValues)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const commandValue = commandValues[key]
    const label = commandValue.label
    const abilityLabel = abilityValues[commandValue.ability].correction
    const skillLabel = normalSkills[commandValue.skill].upperLimit
    const diceRollCorrection = getDiceRollCorrection(abilityLabel, skillLabel)

    const commandLabel = ['2d6 ', label, '[', diceRollCorrection, ']'].join('')
    result.push(commandLabel)
  }
  result.push(getPadCommand(personalAbilityDices))
  
  return result.join('\n')
}

function getPadCommand(personalAbilityDices){
  /**
   * PADを追加する部分
   */
  const result = ['1d6 発動PAD決定[']
  const keys = Object.keys(personalAbilityDices)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const personalAbilityDice = personalAbilityDices[key]
    const label = personalAbilityDice.label
    const personalAbility = personalAbilityDice.personalAbility
    let personalAbilityLabel = 'なし'
    if(personalAbility){
      if(personalAbility.label){
        personalAbilityLabel = personalAbility.label
      }
    }
    const padString = [label,':',personalAbilityLabel,', '].join('')
    result.push(padString)
  }
  return result.join('')
}

function getDiceRollCorrection(correctionLabel1, correctionLabel2) {
  const convertObj = {
    '1,2,3->6': 10,
    '1,2->6': 9,
    '1,2->5': 8,
    '1,2->4': 7,
    '1->5': 6,
    '1->4': 5,
    '1->3': 4,
    '1->2': 3,
    '-': 2,
    '6->5': 1,
    '6->4': 0
  }
  if(convertObj[correctionLabel1]>convertObj[correctionLabel2]){
    return correctionLabel2
  }
  return correctionLabel1
}
const commandValues = {
  vsCommand: {
    label: 'イニシアティブ勝負《知力:指揮:対決》',
    ability: 'intelligence',
    skill: 'command',
    msLimit: false
  },
  vsMotionMsPiloting: {
    label: 'MS運動勝負《運動:MS操縦:対決》',
    ability: 'motion',
    skill: 'msPiloting',
    msLimit: false
  },
  msEvasionJudg: {
    label: 'MS回避判定《反応:MS操縦:MSによる》',
    ability: 'reflexes',
    skill: 'msPiloting',
    msLimit: true
  },
  msMeleeHitJudg: {
    label: 'MS格闘命中判定《運動:MS操縦:武器による》',
    ability: 'motion',
    skill: 'msPiloting',
    msLimit: true
  },
  msShootingHitJudg: {
    label: 'MS射撃命中判定《技量:MS操縦:武器による》',
    ability: 'technique',
    skill: 'msPiloting',
    msLimit: true
  },
  covertJudg: {
    label: '隠密判定《運動:隠蔽:目標値による》',
    ability: 'motion',
    skill: 'conceal',
    msLimit: false
  },
  concealmentJudg: {
    label: '隠蔽判定《技量:隠蔽:目標値による》',
    ability: 'technique',
    skill: 'conceal',
    msLimit: false
  },
  detectionJudg: {
    label: '探知判定《反応:隠蔽:目標値による》',
    ability: 'reflexes',
    skill: 'conceal',
    msLimit: false
  },
  unofficialInformationJudg: {
    label: '非公式情報判定《知力:情報通:目標値による》',
    ability: 'intelligence',
    skill: 'insider',
    msLimit: false
  },
  officialInformationJudg: {
    label: '公式情報判定《知力:博識:目標値による》',
    ability: 'intelligence',
    skill: 'Knowledgeable',
    msLimit: false
  },
  understandTheWarSituationJudg: {
    label: '戦況把握判定《知力:戦術:目標値による》',
    ability: 'intelligence',
    skill: 'tactics',
    msLimit: false
  },
  mechanicalInvestigationJudg: {
    label: '機械調査判定《知力:メカニクス:目標値による》',
    ability: 'intelligence',
    skill: 'engineering',
    msLimit: false
  },
  repairJudg: {
    label: '修理判定《技量:メカニクス:目標値による》',
    ability: 'technique',
    skill: 'engineering',
    msLimit: false
  },
  softwareJudg: {
    label: 'ソフトウェア判定《知力:ソフトウェア:目標値による》',
    ability: 'intelligence',
    skill: 'software',
    msLimit: false
  },
  telecomJudg: {
    label: '通信判定《知力:通信:目標値による》',
    ability: 'intelligence',
    skill: 'telecom',
    msLimit: false
  },
  avoidanceJudg: {
    label: '体術判定《運動:体術:目標値による》',
    ability: 'motion',
    skill: 'avoidance',
    msLimit: false
  },
  martialArtsJudg: {
    label: '個人格闘判定《運動:個人格闘:目標値による》',
    ability: 'motion',
    skill: 'martialArts',
    msLimit: false
  },
  firearms: {
    label: '歩兵火器判定《技量:歩兵火器:目標値による》',
    ability: 'technique',
    skill: 'firearms',
    msLimit: false
  },
  carActionJudg: {
    label: '車両操縦判定《運動:車両操縦:目標値による》',
    ability: 'motion',
    skill: 'driving',
    msLimit: false
  },
  carOerationJudg: {
    label: '車両精密操作判定《技量:車両操縦:目標値による》',
    ability: 'technique',
    skill: 'driving',
    msLimit: false
  },
  airplaneActionJudg: {
    label: '航空機操縦判定《運動:航空機操縦:目標値による》',
    ability: 'motion',
    skill: 'airplaneControl',
    msLimit: false
  },
  airplaneOerationJudg: {
    label: '航空機精密操作判定《技量:航空機操縦:目標値による》',
    ability: 'technique',
    skill: 'airplaneControl',
    msLimit: false
  },
  spacePlanActionJudg: {
    label: '航宙機操縦判定《運動:航宙機操縦:目標値による》',
    ability: 'motion',
    skill: 'spacePlaneControl',
    msLimit: false
  },
  spacePlanOerationJudg: {
    label: '航宙機精密操作判定《技量:航宙機操縦:目標値による》',
    ability: 'technique',
    skill: 'spacePlaneControl',
    msLimit: false
  },
  msActionJudg: {
    label: 'MS操縦判定《運動:MS操縦:目標値による》',
    ability: 'motion',
    skill: 'msPiloting',
    msLimit: false
  },
  msOerationJudg: {
    label: 'MS精密操作判定《技量:MS操縦:目標値による》',
    ability: 'technique',
    skill: 'msPiloting',
    msLimit: false
  },
  shipHandlingJudg: {
    label: '艦艇操縦判定《知力:艦艇操縦:目標値による》',
    ability: 'intelligence',
    skill: 'shipHandling',
    msLimit: false
  },
  bombardingJudg: {
    label: '砲撃判定《知力:砲撃:目標値による》',
    ability: 'intelligence',
    skill: 'bombarding',
    msLimit: false
  },
  consultationJudg: {
    label: '診察判定《知力:医術:目標値による》',
    ability: 'intelligence',
    skill: 'medicine',
    msLimit: false
  },
  surgeryJudg: {
    label: '手術判定《技量:医術:目標値による》',
    ability: 'technique',
    skill: 'medicine',
    msLimit: false
  },
  artJudg: {
    label: '芸術判定《感応:芸術:目標値による》',
    ability: 'psychic',
    skill: 'art',
    msLimit: false
  },
}

export function getChatPallet(pcData, externalUrl) {
  const guidelines = pcData.value.guidelines
  const specialSkills = pcData.value.specialSkills
  const abilityValues = pcData.value.abilityValues
  const normalSkills = pcData.value.normalSkills
  const subAbilityValues = pcData.value.subAbilityValues
  const personalAbilityDices = pcData.value.personalAbilityDices
  const memo = getMemo(pcData, guidelines, specialSkills, abilityValues, normalSkills, personalAbilityDices)
  const chatPallet = {
    kind: 'character',
    data: {
      name: pcData.value.personalData.name.value,
      externalUrl: externalUrl,
      iconUrl: '',
      color: '#FF0066',
      secret: false,
      commands: getCommand(abilityValues, normalSkills,personalAbilityDices),
      memo: memo,
      status: getStatus(subAbilityValues),
      params: getParams(abilityValues)
    }
  }
  return JSON.stringify(chatPallet)
}
