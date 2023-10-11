import {toSync} from './to'

export let tygerNow = toSync(() => performance.timeOrigin + performance.now())
