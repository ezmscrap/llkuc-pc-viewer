import definition from '../json/definition.json'
import guidlines from '../json/guidlines.json'
import careers from '../json/careers.json'

export const openChatPalletDaialog = async function (text, $q) {
  const ShowOnDialog = async function (text, $q) {
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'チャットパレットの出力',
        message: text
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await ShowOnDialog(text, $q)
  }
  return await retrunSelectData()
}

export const openGetDataDialog = async function (text, $q) {
  const selectOnDialog = async function (text, $q) {
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'データの出力',
        message: text
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await selectOnDialog(text, $q)
  }
  return await retrunSelectData()
}

export const openPutDataDialog = async function ($q) {
  const selectOnDialog = async function ($q) {
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'データの入力',
        message: '情報出力ボタンで取得した文字列データを入力してください',
        prompt: {
          model: '',
          type: 'text'
        },
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await selectOnDialog($q)
  }
  return await retrunSelectData()
}

export const openPersonalDataDialog = async function (key, $q) {
  const selectOnDialog = async function (key, $q) {
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'データの入力',
        message: definition[key].label + 'の値を入力してください',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await selectOnDialog(key, $q)
  }
  return await retrunSelectData()
}

export const openNoteDialog = async function (key, $q) {
  const selectOnDialog = async function (key, $q) {
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'データの入力',
        message: definition[key].label + 'の値を入力してください',
        prompt: {
          model: '',
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await selectOnDialog(key, $q)
  }
  return await retrunSelectData()
}

export const openGrowthValueDialog = async function ($q, explanationText, growthValueKey) {
  const selectOnDialog = async function ($q, explanationText, growthValueKey) {
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'データの入力',
        message: definition[growthValueKey].label + 'の値を入力してください',
        prompt: {
          model: explanationText,
          type: 'text'
        },
        cancel: true,
        persistent: true
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await selectOnDialog($q, explanationText, growthValueKey)
  }
  return await retrunSelectData()
}

export const openGuidelineDialog = async function (key, $q) {
  const selectOnGuidelineDialog = async function (key, $q) {
    const items = createGuidelineItems()
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'データの入力',
        message: definition[key].label + 'を選択してください',
        options: {
          type: 'radio',
          model: 'opt1',
          items: items[key]
        },
        maximized: true,
        cancel: true,
        persistent: true
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await selectOnGuidelineDialog(key, $q)
  }
  return await retrunSelectData()
}

export const openCareerDialog = async function (key, $q) {
  const selectOnDialog = async function (key, $q) {
    const items = createCareerItems()
    return new Promise(function (resolve) {
      $q.dialog({
        title: 'データの入力',
        message: definition[key].label + 'を選択してください',
        options: {
          type: 'radio',
          model: 'opt1',
          items: items
        },
        maximized: true,
        cancel: true,
        persistent: true
      }).onOk(function (data) {
        resolve(data)
      })
    })
  }
  const retrunSelectData = async function () {
    return await selectOnDialog(key, $q)
  }
  return await retrunSelectData()
}
  
function createGuidelineItems() {
  const items = {
    firstGuideline: [],
    secondGuideline: []
  }
  const itemKeys = Object.keys(items)
  for (let itemIndex = 0; itemIndex < itemKeys.length; itemIndex++) {
    const itemKey = itemKeys[itemIndex]
    const guidlineItems = guidlines[itemKey]
    const guidelineItemKeys = Object.keys(guidlineItems)
    for (let index = 0; index < guidelineItemKeys.length; index++) {
      const guidlineItemkey = guidelineItemKeys[index]
      const guidline = guidlineItems[guidlineItemkey]
      const label = guidline.label + '/' + guidline.explanation
      const item = {
        label: label,
        value: guidlineItemkey
      }
      items[itemKey].push(item)
    }
  }
  return items
}

function createCareerItems() {
  const items = [
    {
      label: 'この経歴を削除する',
      value: null
    }
  ]
  const keys = Object.keys(careers)
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const career = careers[key]
    const label = career.label + '/' + career.explanation
    const item = {
      label: label,
      value: key
    }
    items.push(item)
  }
  return items
}
