const Done: IteratorResult<never> = {done: true, value: undefined}

/**
 * Iterator helpers, based on [`tc39/proposal-iterator-helpers`](https://github.com/tc39/proposal-iterator-helpers).
 */
export class Ita<Value> {
    static from<Value>(iterable: Iterable<Value>) {
        return new Ita(iterable[Symbol.iterator]())
    }

    constructor(readonly iterator: Iterator<Value>) {
    }

    [Symbol.iterator]() {
        return this.iterator
    }

    map<Result>(fn: (value: Value) => Result) {       
        return new Ita({ next: () => {
            let next = this.iterator.next()
            if (next.done) return next
            return {
                done: false,
                value: fn(next.value),
            }
        } })
    }

    filter<Result extends Value>(fn: (value: Value) => value is Result) {
        return new Ita({ next: () => {
            for (;;) {
                const next = this.iterator.next()
                if (next.done || fn(next.value)) return next
            }
        } })
    }

    take(limit: number) {
        var l = limit
        return new Ita({ next: () => {
            if (l--) return this.iterator.next()
            return Done
        } })
    }

    drop(count: number) {
        var l = count
        return new Ita({ next: () => {
            while (l--) {
                var next = this.iterator.next()
                if (next.done) return next
            }
            return this.iterator.next()
        } })
    }

    flatMap<Result>(fn: (value: Value) => Iterator<Result>) {
        var curr: Iterator<Result> | undefined
        return new Ita({ next: () => {
            if (curr) {
                var next: IteratorResult<any> = curr.next()
                if (next.done) curr = undefined 
                else return next.value
            }
            for (;;) {
                next = this.iterator.next()
                if (next.done) return next
                next = (curr = fn(next.value)).next()
                if (!next.done) return next.value
            }
        } })
    }

    reduce(fn: (accum: Value, value: Value) => Value, value?: Value): Value
    reduce<Result>(fn: (accum: Result, value: Value) => Result, init: Result): Result {
        if (init === undefined) {
            var next = this.iterator.next()
            if (next.done) throw new TypeError('Reduce of empty iterator with no initial value')
            init = next.value! as Result
        }
        for (const value of this) {
            init = fn(init, value)
        }
        return init
    }

    toArray() {
        return Array.from(this)
    }

    toSet() {
        return new Set(this)
    }

    forEach(fn: (value: Value) => void) {
        for (const value of this) fn(value)
    }

    some(fn: (value: Value) => boolean) {
        for (const value of this) {
            if (fn(value)) return true
        } 
        return false
    }

    every(fn: (value: Value) => boolean) {
        for (const value of this) {
            if (!fn(value)) return false
        } 
        return true
    }
}