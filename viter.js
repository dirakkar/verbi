import {viterConfig} from './src/viter-config'

export default viterConfig({
	package: name => `@verbi/${name}`,
	packages: {
		common: {
			manifest: {
				description: 'Common JavaScript and TypeScript utilities.',
				keywords: ['stdlib', 'util', 'utils', 'common', 'pure', 'typed', 'typescript', 'type-fest', 'lodash', 'ramda'],
			},
			export: [
				'noop',
				'formula',
				'random',
				'rec',
				'array',
				'error',
				'rethrow',
				'promise',
				'disposable',
				'pipe',
				'decorator',
				'once',
				'val',
				'json',
				'timer',
				'listener',
				// 'dag',
			],
		},

		compare: {
			manifest: {
				description: 'Efficient deep comparison of two values.',
				keywords: ['compare', 'equals', 'is-equal', 'equality', 'deep'],
			},
			export: [
				'compare',
			],
		},

		tyger: {
			manifest: {
				description: 'Advanced library for reactive programming',
				keywords: ['state management', 'state manager', 'reactivity', 'reactive', 'observable', 'async', 'frp', 'model', 'oop', 'logic', 'data flow'],
			},
			export: [
				'atom',
				// 'atom-dag',
				'action',
				'cell',
				'dict',
				'to',
				'base',
				'tyger-now',
				'tyger-interval',
				'tyger-sleep',
				'tyger-event',
				'tyger-fetch',
			],
		},

		'tyger-web': {
			manifest: {
				description: 'Web API bindings for Tyger, an advanced reactive programming library.'
			},
			export: [
				'tyger-navigator',
				'tyger-document',
				'tyger-screen',
				'tyger-media',
			],
		},

		'tyger-node': {
			manifest: {
				description: 'NodeJS API bindings for Tyger, an advanced reactive programming library.',
			},
			export: [
				'tyger-file',
			],
		},

		specto: {
			manifest: {
				description: 'Minimal testing framework.',
				keywords: ['unit testing', 'testing', 'test', 'assert', 'assertions', 'tap', 'uvu', 'ava', 'jest'],
			},
			export: [
				'assert',
				'mock',
				'test',
				'suite',
			],
		},

		murmur: {
			manifest: {
				description: 'Incremental MurmurHash3 hashing algorithm implementation.',
				keywords: ['imurmurhash-js', 'murmurhash3', 'murmurhash', 'murmur', 'hash', 'hashing', 'checksum', 'incremental'],
			},
			export: [
				'murmur',
			],
		},

		ansi: {
			manifest: {
				description: 'Utilities for working with ANSI escape sequences.',
				keywords: ['ansi', 'wrap-ansi', 'chalk', 'yoctocolors', 'console', 'terminal', 'tty', 'styling'],
			},
		},

		viter: {
			manifest: {
				description: 'The ultimate JavaScript build tool.',
				keywords: ['build', 'bundle', 'bundler', 'development', 'rollup', 'vite', 'webpack', 'parcel', 'turbo', 'turborepo', 'turbopack', 'caching'],
			},
			export: [
				'viter-',
			],
			bin: 'viter-bin',
		},

		// oko: {
		// 	manifest: {
		// 		description: 'Advanced Web UI framework.',
		// 		keywords: ['tyger', 'reactive', 'component', 'components', 'framework', 'ui', 'rendering', 'dom', 'react', 'preact', 'vue', 'svelte', 'ui kit', 'ui', 'gui', 'virtual dom', 'vdom'],
		// 	},
		// 	export: [
		// 		'oko-',
		// 	],
		// },

		// antiar: {
		// 	manifest: {
		// 		description: 'Declarative model composition language for Tyger, an advanced reactive programming library.',
		// 		keywords: ['tyger', 'oko'],
		// 	},
		// 	export: [
		// 		'antiar-',
		// 	],
		// },

		// marcus: {
		// 	manifest: {
		// 		description: 'Lightweight Markdown library.',
		// 		keywords: ['markdown', 'marked', 'commonmark', 'gfm', 'markdown-it', 'remarkable', 'remark', 'text', 'rich text', 'parsing', 'html'],
		// 	},
		// },
	},
})
