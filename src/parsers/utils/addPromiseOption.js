export default function addPromiseOption(func) {
  return (fileOrString, optionsOrCallback, options) => {
    if (typeof optionsOrCallback !== "function") { 
      //if there is no callback, assume the promise interface should be used
      if (options) {
        throw new Error("Incorrect useage of xxxxToJson. The signature should either be xxxxToJson(fileOrString, callback, options) or xxxxToJson(fileOrString, options) but you have something different!")
      }
      return new Promise((resolve) => {
          func(fileOrString, resolve, optionsOrCallback)
      })
    } else {
      return func(fileOrString, optionsOrCallback, options)
    }
  }
};
