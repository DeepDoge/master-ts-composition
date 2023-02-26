# InstanceableTypes

InstanceableTypes let's you create compositions with your TS types while adding runtime typechecking to them with `instanceof` keyword.<br />

# Installation

```bash
npm install https://github.com/DeepDoge/master-instanceable-types.git
```

# Usage

```ts
type Monster = {
	name: string
}
const Monster = instanceableType<Monster>() // InstaceableType<Monster>
function createMonster(name: string) {
	return Monster({ name })
}

const monster1 = createMonster("monster 1") // Monster

console.log(monster1 instanceof Monster) // true

type Walker = {
	walk(): void
}
const Walker = instanceableType<Walker>() // InstanceableType<Walker>
function createWalker() {
	return Walker({
		walk() {
			console.log("walk")
		},
	})
}

type Attacker = {
	attack(): void
}
const Attacker = instanceableType<Attacker>() // InstanceableType<Attacker>
function createAttacker() {
	return Attacker({
		attack() {
			console.log("attack")
		},
	})
}

const AttackerWalkerMonster = instanceableType(Monster).intersect(Attacker).intersect(Walker).$() // InstanceableType<Monster & Attacker & Walker>
function createAttackerWalkerMonster(name: string) {
	return AttackerWalkerMonster({
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
const AttackerWalker = instanceableType(Attacker).intersect(Walker).$() // InstaceableType<Attacker & Walker>
console.log(monster2 instanceof AttackerWalker) // true
```
