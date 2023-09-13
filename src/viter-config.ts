import {Rec} from './rec'
import {ViterCacheStore} from './viter-cache'
import {ViterPackageManifest} from './viter-package-manifest'

export interface ViterConfig {
	cacheStore?: () => ViterCacheStore
	manifest?: (pkg: string) => ViterPackageManifest
	packages?: Rec<ViterConfigPackage>
}

export interface ViterConfigPackage {
	manifest?: ViterPackageManifest
	export: string[]
	bin?: string
}

export function viterConfig(config: ViterConfig) {
	return config
}
