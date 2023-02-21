# InstanceableTypes

InstanceableTypes let's you convert your TS types into JS classes, and let's you extend them with unlimited number of other InstanceableType(s).<br />
This allows you to create compositions with factory functions that has natural runtime typechecking with the keyword `instanceof`.

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
  
  const AttackerWalkerMonster = Monster.intersect(Attacker).intersect(Walker).$() // InstanceableType<Monster & Attacker & Walker>
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
  
  monster2.attack() // "Monster 2 attacks"
  
  // Event better, you can even do this!
  const AttackerWalker = Attacker.intersect(Walker).$() // InstaceableType<Attacker & Walker>
  console.log(monster2 instanceof AttackerWalker) // true
```
