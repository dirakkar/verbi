// based on type-fest:
// https://github.com/sindresorhus/type-fest/blob/main/source/package-json.d.ts
//
// tuned to match our needs:
// - the package manager is always pnpm
// - no workspaces
// - no pre/post scripts
// - no subpath imports/exports
// - no commonjs

import {JsonObject, JsonValue} from './json'
import {Rec} from './rec'

export type ViterPackageManifestPerson =
	| string
	| {
		name: string
		url?: string
		email?: string
	}

export type ViterPackageManifestDeps = Rec<string>

export interface ViterPackageManifest {
	// Non-standard entry points

	module?: string
	esnext?:
		| string
		| {
			[moduleName: string]: string | undefined
			main?: string
			browser?: string
		}
	browser?:
		| string
		| Rec<string | false>
	sideEffects?: boolean | string[]

	// TypeScript

	types?: string
	typesVersions?: Rec<Rec<string[]>>
	typings?: string

	// npm

	name?: string
	version?: string
	description?: string
	keywords?: string[]
	homepage?: string
	bugs?:
		| string
		| {
			url?: string
			email?: string
		}
	license?: string
	licenses?: Array<{
		type?: string
		url?: string
	}>
	author?: ViterPackageManifestPerson
	contributors?: ViterPackageManifestPerson[]
	maintainers?: ViterPackageManifestPerson[]
	files?: string[]
	type?: 'module'
	main?: string
	bin?:
		| string
		| Partial<Rec<string>>
	man?: string | string[]
	directories?: {
		bin?: string
		doc?: string
		example?: string
		lib?: string
		man?: string
		test?: string
	}
	repository?:
		| string
		| {
			type: string
			url: string
			directory?: string
		}
	scripts?: {
		prepare?: string
		publish?: string
		install?: string
		uninstall?: string
		version?: string
		test?: string
		stop?: string
		start?: string
		restart?: string
	} & Rec<string>
	config?: JsonObject
	dependencies?: ViterPackageManifestDeps
	devDependencies?: ViterPackageManifestDeps
	optionalDependencies?: ViterPackageManifestDeps
	peerDependencies?: ViterPackageManifestDeps
	peerDependenciesMeta?: Rec<{optional: true}>
	engines?: {
		[EngineName in 'npm' | 'node' | string]?: string
	}
	os?: (
		| 'aix'
		| 'darwin'
		| 'freebsd'
		| 'linux'
		| 'openbsd'
		| 'sunos'
		| 'win32'
		| '!aix'
		| '!darwin'
		| '!freebsd'
		| '!linux'
		| '!openbsd'
		| '!sunos'
		| '!win32'
	) & string
	cpu?: (
		| 'arm'
		| 'arm64'
		| 'ia32'
		| 'mips'
		| 'mipsel'
		| 'ppc'
		| 'ppc64'
		| 's390'
		| 's390x'
		| 'x32'
		| 'x64'
		| '!arm'
		| '!arm64'
		| '!ia32'
		| '!mips'
		| '!mipsel'
		| '!ppc'
		| '!ppc64'
		| '!s390'
		| '!s390x'
		| '!x32'
		| '!x64'
	) & string
	private?: boolean
	publishConfig?: {
		[additionalProperties: string]: JsonValue | undefined
		access?: 'public' | 'restricted'
		registry?: string
		tag?: string
	}
	funding?: string | {
		type?: (
			| 'github'
			| 'opencollective'
			| 'patreon'
			| 'individual'
			| 'foundation'
			| 'corporation'
		) & string
		url: string
	}

	// Node

	packageManager?: string
}

