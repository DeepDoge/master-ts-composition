type Obj = Record<string, any>

export type Intersector<This extends Obj> = {
	intersect<Other extends Obj>(other: InstanceableType<Other>): Intersector<This & Other>
	$(): InstanceableType<This>
}

export type InstanceableType<This extends Obj> = {
	" __is_intersection__ ": boolean
	" __intersections__ ": Set<InstanceableType<any>>
	intersect<Other extends Obj>(other: InstanceableType<Other>): Intersector<This & Other>
	new <Init extends Obj>(init: This extends Init ? Init : never): This
}

export function instanceableType<This extends Obj = {}>() {
	return class<Init extends Obj> {
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
				intersect<Other extends Obj>(other: InstanceableType<Other>) {
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

		constructor(init: This extends Init ? Init : never) {
			Object.assign(this, init)
		}
	} as any as InstanceableType<This>
}
