export function createKeysByType(definition, type) {
  const keys = []
  const definitionKeys = Object.keys(definition)
  for (let index = 0; index < definitionKeys.length; index++) {
    const definitionKey = definitionKeys[index]
    const definitionItem = definition[definitionKey]
    const definitionItemType = definitionItem.type.key
    if (type == definitionItemType) {
      keys.push(definitionKey)
    }
  }
  return keys
}
