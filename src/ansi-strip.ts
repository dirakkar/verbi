// https://github.com/chalk/ansi-regex/blob/main/index.js

let ansiRegexp = new RegExp('[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))', 'g')

export let ansiStrip = (string: string) => {
    return string.replace(ansiRegexp, '')
}
