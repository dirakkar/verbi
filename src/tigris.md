This module implements core data structures and algorithms of Tigris, an advanced library for reactive programming.

## Vocabulary

Nouns/Adjectives:

| Gender    | Singular   | Plural    | Literal translation   |
| --------- | ---------- | --------- | --------------------- |
| neuter    | Corpus     | Corpora   | Body, atom            |
| masculine | Effectus   | Effectūs  | Execution             |
| feminine  | Cella      | Cellae    | Barn                  |
| feminine  | Formula    | Formulae  | Formula               |
| masculine | Genus      | Genera    | Kind                  |
| neuter    | Activum    | -         | Active                |
| neuter    | Affine     | Affinia   | Adjacent              |
| neuter    | Remōtum    | Remōta    | Remote                |
| neuter    | Superius   | Superiōra | Above                 |
| neuter    | Īnferius   | Īnferiōra | Below                 |
| neuter    | Integrum   | -         | Complete, intact      |
| neuter    | Incertum   | -         | Unsure                |
| neuter    | Obsolētum  | -         | Obsolete, out-of-date |
| neuter    | Mortuum    | -         | Dead                  |
| neuter    | Moribundum | Moribunda | Dying                 |

Verbs:

| Infinitive | Imperative | Literal translation |
| ---------- | ---------- | ------------------- |
| Delēre     | Dēlē       | Destroy             |
| Vellere    | Velle      | Pull                |
| Pellere    | Pelle      | Push                |
| Pōnere     | Pōne       | Put                 |
| Speculor   | Specula    | Spy                 |
| Prōpāgāre  | Prōpāgā    | Propagate           |
| Invenīre   | Invenī     | Discover            |
| Integrāre  | Integrā    | Renew               |
| Secāre     | Secā       | Cut                 |
| Suspendere | Suspende   | Suspend             |

Adverbs:

| Word | Literal translation |
| Semel | Once |

Prepositions:

| Word | Literal translations |
| Pro | For |

## Description

The heart of Tigris is highly optimized, therefore somewhat difficult to understand by reading the implementation. This section provides a set of facts to help you wrap your around how the reactive machinery works internally.

### Corpus

A corpus is a piece of reactive state. Corpora may store links to other corpora, acting as nodes in the directed acyclic graph of reactive states.

| Property name | Expanded name | Description                               |
| ------------- | ------------- | ----------------------------------------- |
| `c`           | **c**ella     | The value the formula returned (or threw) |
| `s`           | **s**uperius  | Index of the first corpus superius affīne |
| `i`           | **i**nferius  | Index of the first corpus inferius affīne |
| `t`           | s**t**atus    |                                           |
| `h`           | **h**ost      | Formula execution context                 |
| `d`           | **d**ata      | Variable data                             |

### Corpus data

All the variable data of a corpus is stored in the `d` field and is divided into three segments by `i` and `s` fields:

- `0` - `corpus.s`: arguments — list of arguments applied to the corpus formula by [`tigrisIntegra`](#integra)
- `corpus.s` - `corpus.i`: corpora superiōra affinia — ordered, holey list of corpus-backreference pairs
- `corpus.i` - `corpus.d.length - 1`: corpora inferiōra affinia — unordered list of corpus-backreference pairs

Corpora affinia segments are essentially lists of connections and because every connection is bidirectional, after every reference to a peer corpus there is index of this corpus in peer's data array.

Here is an example of what data lists of nodes of a graph of 3 corpora might look like:

```
TigrisCorpus [a] {
	d: [arg1, arg2, arg3, b, 0, c, 0],
}

TigrisCorpus [b] {
	d: [a, 3, c, 2],
}

Corpus [c] {
	d: [a, 5, b, 2],
}
```

Note that corpora superiōra affinia may contain holes because [effectūs](#effectus) a corpus depends on may [delēre](#dele) themselves during [`tigrisIntegra`](#integra).

### Effectus

An effectus is a special kind of corpus that represents the state of execution of some asynchronous task. All effectūs are instances of `TigrisEffectus` class which inherits from `TigrisCorpus`. The class neither adds new properties nor overrides existing methods and exists only so that algorithms can determine if a corpus is an effectus through `instanceof`.

Effectūs are always created with [`tigrisVoca`](#voca).

### Integra

This section describes the `tigrisIntegra` runtime function. To integrāre a corpus is to ensure that it and its corpora superiōra remōta have integer [status](#status). The procedure can be divided into three major steps:

1. check if corpus is already integrum and do nothing in that case
2. rerun the formula and hnadle its execution result
3. [pōnere](#pone) the formula execution result

### Velle

This section describes the `tigrisVelle` runtime function.

### Pelle

This section describes the `tigrisPelle` runtime function.

### Pone

### Dele

### Seca

### Move

### Inveni

### Propaga

### Status

- `-1`: obsoletum
- `-2`: incertum
- `-3`: integrum
- `-4`: mortuum
