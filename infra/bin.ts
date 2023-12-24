import {start} from './start'
import {release} from './release'
import {report} from './report'

const Commands = {
	start,
	release,
}

const [commandName, ...args] = process.argv.slice(2)

const command = Commands[commandName as keyof typeof Commands]
if (!command) {
	panic(`Unknown command "${commandName || ''}"`)
}

command().catch(panic)

function panic(error: any) {
	report('fatal', error)
	process.exit(1)
}
