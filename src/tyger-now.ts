import {toSync} from './to'

export const tygerNow = toSync(Date.now)

export const tygerNowPrecise = toSync(() => performance.timeOrigin + performance.now())
