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

function getCommand(abilityValues, normalSkills) {
  /**
   * イニシアティブ判定
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
  return result.join('\n')
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
    label: 'MS射撃命中判定《射撃:MS操縦:武器による》',
    ability: 'technique',
    skill: 'msPiloting',
    msLimit: true
  }
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
      commands: getCommand(abilityValues, normalSkills),
      memo: memo,
      status: getStatus(subAbilityValues),
      params: getParams(abilityValues)
    }
  }
  return JSON.stringify(chatPallet)
}
