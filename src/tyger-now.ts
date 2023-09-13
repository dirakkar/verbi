import {toSync} from './to'

export const tygerNow = toSync(() => performance.timeOrigin + performance.now())
