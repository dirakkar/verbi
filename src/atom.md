# `atom`

Atoms are unified building blocks of reactive systems. `Atom` API is low-level and thus not recommended for direct usage in the applied code. If you are looking for the overview of reactivity in Verbi, read the [Reactivity](../doc/reactivity.md) document.

## Members

### Properties

- `i`: identifier
- `f`: formula
- `c`: cached value
- `h`: formula execution context (host)
- `t`: either linking progress or atom status
- `d`: dynamic data
- `p`: first publisher index
- `s`: first subscriber index

### `pull`

If an atom pulls itself, returns the previous cached value. Othwerise, if an atom is already pulling, throws a circular subscription error. If `Atom.linking` is avaialble, links it to self as a subscriber. Finally, returns the cached value.

### `snapshot`

An action wrapper for `pull`.

### `push`

An action that writes the result result of execution of formula with provided arguments to the cache.

### `set`

### `refresh`

### `cut`

### `mark`

### `absorb`

### `cp`

Copies the slot at position `from` to `to`. Also sets the slot's backlink to `to`.

### `dispose`

An instance method that is called when it's time to destroy the atom. It unlinks the atom from all peers, marks it as dead (`t = -4`) and releases cache.

Atoms, created by `cell` and `dict` decorators, override this method to also delete themselves from the maps where it's stored so it can be scavenged by GC.
