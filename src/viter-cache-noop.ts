import {Model} from './model'
import {ViterCacheStore} from './viter-cache'

export class ViterCacheNoop extends Model implements ViterCacheStore {
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
