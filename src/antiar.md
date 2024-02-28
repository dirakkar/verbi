Elegant domain-specific language (DSL) for describing and composing [Fōrmae](./forma.md).

## Description

An Antiar document consists of zero or more [Fōrma](#forma) declarations separated with an empty line. APIs like `antiarForma` allow strictly one [Fōrma](#forma) declaration.

### Forma

To declare a Fōrma, write its name and the name of Fōrma it inherits from separated with a space:

```antiar
Child Parent
```

```ts
class Child extends Parent {
}
```

It's possible to declare and provide type parameters in Fōrmae declarations like you would in plain TypeScript:

```antiar
Child<T1, T2 extends Constraint, T3 = Default> Parent<T3, [true]>
```

```ts
class Child<T1, T2 extends Constraint, T3 = Default> Parent<T3, [true]> {
}
```

Fōrma declaration is followed by an indented list of zero or more [Partēs](#pars):

```antiar
Child Parent
	pars1
	pars2
	pars3
```

```ts
class Child extends Parent {
	pars1() {
		// ...
	}

	pars2() {
		// ...
	}

	pars3() {
		// ...
	}
}
```

### Pars

To declare a Pars, write its name and its [Value](#pars-value) description separated with space:

```
Child Parent
	greeting 'Hello, world!'
```

```ts
class Child extends Parent {
	greeting() {
		return 'Hello, world!'
	}
}
```

To make Pars Mūtābilis, add `muta` keyword before its name:

```antiar
Child Parent
	muta count 0
```

```ts
class Child extends Parent {
	@tene greeting(next?: string) {
		if (next !== undefined) return next
		return 'Hello, world!'
	}
}
```

To make Pars Multiplex, add the Discrīminātor type in square brackets after the Part name:

```antiar
Child Parent
	userName[string] 'Anonymous'
```

```ts
class Child extends Parent {
	userName(dis: string) {
		return 'Anonymous'
	}
}
```

Values of Partēs Multiplicēs may reference Discrīminātor.

### Pars Value

A Pars Value may be one of the following:

- [Plain Value](#plain-value)
- [Exemplum](#exemplum)

### Plain Value

A Plain Value may be one of the following:

- [Primitive](#primitive)
- [Array](#array)
- [Dictionary](#dictionary)
- [Pars Reference](#pars-reference)
- [Discrīminātor Reference](#discriminator-reference) (inside of Partēs Multiplicēs)

### Primitive

Antiar Primitives are a subset of JavaScript literals:

- `null` literal
- string literal
- floating point number literal

```antiar
Child Parent
	isNull null
	isString 'Hello, world!'
	isNumberDec 3.141592653589793
	isNumberHex 0xABBABABE
```

```ts
class Child extends Parent {
	isNull() {
		return null
	}

	isString() {
		return 'Hello, world!'
	}

	isNumberDec() {
		return 3.141592653589793
	}

	isNumberHex() {
		return 0xABBABABE
	}
}
```

### Array


```antiar
Child Parent
	isArrays []
		[]
			0
			false
			null
		[]
			1
			true
			'yay'
	isNumbers [number | null]
		2
		3
		null
		5
		6
```

```ts
class Child extends Parent {
	isArrays() {
		return [
			[
				0,
				false,
				null,
			],
			[
				1,
				true,
				'yay',
			],
		]
	}

	isNumbers(): (number | null)[] {
		return [
			2,
			3,
			null,
			5,
			6,
		]
	}
}
```

### Pars Reference

### Discriminator Reference

### Exemplum

### Comment

Antiar, like JavaScript, ignores line contents after `//` sequence.
