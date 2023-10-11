import {tygerEvent} from './tyger-event'

export let tygerScreenOrientation = () => {
	tygerEvent(screen.orientation, 'change')
	return screen.orientation.type
}

export let tygerScreenAngle = () => {
	tygerEvent(screen.orientation, 'change')
	return screen.orientation.angle
}
