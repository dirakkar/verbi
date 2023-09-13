import {tygerEvent} from './tyger-event'

export function tygerScreenOrientation() {
	tygerEvent(screen.orientation, 'change')
	return screen.orientation.type
}

export function tygerScreenAngle() {
	tygerEvent(screen.orientation, 'change')
	return screen.orientation.angle
}
