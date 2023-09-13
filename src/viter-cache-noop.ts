import {Base} from './base'
import {ViterCacheStore} from './viter-cache'

export class ViterCacheNoop extends Base implements ViterCacheStore {
	download() {
		return false
	}

	upload() {
	}

	drop() {
		return false
	}

	purge() {
	}
}
