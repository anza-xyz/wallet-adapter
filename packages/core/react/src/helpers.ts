export const defaultValueForModalProvider = (setterKey: string, valueKey: string, context: string, provider: string) => {
  const defaultContext: Record<string, any> = {};
  defaultContext[setterKey] = (_open: boolean) => {
    console.error(missingProviderErrorMessage(valueKey, context, provider, "action"));
  }
  defaultContext[valueKey] = false;
  Object.defineProperty(defaultContext, `${valueKey}`, {
    get() {
      console.error(missingProviderErrorMessage(valueKey, context, provider, "read"));
      return false;
    }
  })
  return defaultContext;
}

export const missingProviderErrorMessage = (valueName: string, context: string, provider: string, action: string) => {
  return "You have tried to " + ` ${action} "${valueName}"` + " on a " + `"${context}"` 
    + " without providing one. Make sure to render a " + `"${provider}"` + 
    " as an ancestor of the component that uses " + `"${context}".`
}
