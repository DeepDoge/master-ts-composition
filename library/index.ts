type Obj = Record<string, any>

type Intersector<T extends Obj> = {
	intersect<U extends Obj>(other: InstanceableType<U>): Intersector<T & U>
	$(): InstanceableType<T>
}

export type InstanceableType<T extends Obj> = {
	" __is_intersection__ ": boolean
	" __intersections__ ": Set<InstanceableType<any>>
	intersect<U extends Obj>(other: InstanceableType<U>): Intersector<T & U>
	new (init: T): T
}

export function instanceableType<This extends Obj = {}>() {
	return class {
		static [" __is_intersection__ "] = false
		static [" __intersections__ "] = new Set<InstanceableType<any>>()
		static [Symbol.hasInstance]<T extends InstanceType<typeof this>>(value: T): boolean {
			if (this[" __is_intersection__ "]) {
				for (const intersection of this[" __intersections__ "]) if (!(value instanceof intersection)) return false
				return true
			}
			return value?.constructor === this || (value?.constructor as InstanceableType<any>)[" __intersections__ "]?.has(this as any)
		}
		static intersect<Other extends Obj>(other: InstanceableType<Other>) {
			const NEW = instanceableType<This & Other>()
			NEW[" __is_intersection__ "] = true
			const intersectionsOfNEW = NEW[" __intersections__ "]
			intersectionsOfNEW.add(this)
			this[" __intersections__ "].forEach((intersection) => intersectionsOfNEW.add(intersection))
			intersectionsOfNEW.add(other)
			other[" __intersections__ "].forEach((intersection) => intersectionsOfNEW.add(intersection))

			const intersector = {
				intersect<U extends Obj>(other: InstanceableType<U>) {
					intersectionsOfNEW.add(other)
					other[" __intersections__ "].forEach((intersection) => intersectionsOfNEW.add(intersection))
					return intersector
				},
				$() {
					return NEW
				},
			}

			return intersector as Intersector<This & Other>
		}

		constructor(init: This) {
			Object.assign(this, init)
		}
	} as any as InstanceableType<This>
}
