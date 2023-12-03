export function initText(text, arrayitems){
    text.value['explanation']=''
    text.value['values']={}
    arrayitems.forEach(function(arrayItem){
        arrayItem.forEach(function(key){
            text.value.values[key]=null
        })
    })
}

export function setTextExplanation(text,definition){
    const explanations = []
    const growthValues = text.value.values
    const growthValueKeys = Object.keys(growthValues)
    for(let index=0; index<growthValueKeys.length; index++){
        const key = growthValueKeys[index]
        const value = text.value.values[key]
        if(value){
            const typeLabel = definition[key].type.label
            const label = definition[key].label
            explanations.push(createGrowthText(typeLabel, label, value))
        }
    }
    text.value.explanation = explanations.join(',')
}

export function createGrowthText(typeLabel, label, value){
    return typeLabel + '-' + label + ':' + value
}