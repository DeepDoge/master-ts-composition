# MasterInstancer

MasterInstance let's you convert your TS types into JS classes, and let's you extend with unlimited number of extends.<br />
[# Why would I use this?](#why-would-i-use-this)

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
  return new Monster({ name })
}

const monster1 = createMonster("monster 1") // Monster

console.log(monster1 instanceof Monster) // true

type Walker = {
  walk(): void
}
const Walker = instanceableType<Walker>() // InstanceableType<Walker>
function createWalker() {
  return new Walker({
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
  return new Attacker({
    attack() {
      console.log("attack")
    },
  })
}

const AttackerWalkerMonster = Monster.intersect(Attacker).intersect(Walker) // InstanceableType<Monster & Attacker & Walker>
function createAttackerWalkerMonster(name: string) {
  return new AttackerWalkerMonster({
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
const AttackerWalker = Attacker.intersect(Walker)
console.log(monster2 instanceof AttackerWalker) // true

monster2.attack() // "Monster 2 attacks"
```

# Why would I use this?

-   You can use this to create a class hierarchy from your TS types.
-   -   This is useful if you want to use the `instanceof` operator to check if an object is of a certain type.
-   You can normally do this by creating classes by hand, but this is tedious and error-prone. This library allows you to create classes just like you would create interfaces and types.
-   You don't need to define `type` in your interfaces, and do string comparisons to check if an object is of a certain type. You can just use the `instanceof` operator naturally.
