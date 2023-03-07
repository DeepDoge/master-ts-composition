# Master-TS Composition

This let's you create compositions with your TS types while adding runtime typechecking to them with `instanceof` keyword.<br />

# Installation

```bash
npm install https://github.com/DeepDoge/master-ts-composition.git
```

# Usage

```ts
type Monster = {
	name: string
}
const Monster = compositionType<Monster>() // InstaceableType<Monster>
function createMonster(name: string) {
	return Monster.new({ name })
}

const monster1 = createMonster("monster 1") // Monster

console.log(monster1 instanceof Monster) // true

type Walker = {
	walk(): void
}
const Walker = compositionType<Walker>() // CompositionType<Walker>
function createWalker() {
	return Walker.new({
		walk() {
			console.log("walk")
		},
	})
}

type Attacker = {
	attack(): void
}
const Attacker = compositionType<Attacker>() // CompositionType<Attacker>
function createAttacker() {
	return Attacker.new({
		attack() {
			console.log("attack")
		},
	})
}

const AttackerWalkerMonster = compositionType(Monster).intersect(Attacker).intersect(Walker).$() // CompositionType<Monster & Attacker & Walker>
function createAttackerWalkerMonster(name: string) {
	return AttackerWalkerMonster.new({
		...createMonster(name),
		...createWalker(),
		attack() {
			console.log(`${name} attacks`)
		},
	})
}

const monster2 = createAttackerWalkerMonster("Monster 2") // Monster & Attacker & Walker
console.log(monster2 instanceof Monster) // true
console.log(monster2 instanceof Attacker) // true
console.log(monster2 instanceof Walker) // true

monster2.attack() // "Monster 2 attacks"

// Event better, you can even do this!
const AttackerWalker = compositionType(Attacker).intersect(Walker).$() // InstaceableType<Attacker & Walker>
console.log(monster2 instanceof AttackerWalker) // true
```
