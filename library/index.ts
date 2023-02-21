function bindMethods<T extends object>(obj: T): T {
	for (const key of Object.getOwnPropertyNames(obj.constructor.prototype)) {
		const descriptor = Object.getOwnPropertyDescriptor(obj, key)
		if (descriptor?.value instanceof Function) Object.defineProperty(obj, key, { ...descriptor, value: descriptor.value.bind(obj) })
	}
	return obj
}

type Obj = Record<string, any>

export type InstanceableType<T extends Obj> = {
	" __is_intersection__ ": boolean
	" __intersections__ ": Set<InstanceableType<any>>
	intersect<U extends Obj>(other: InstanceableType<U>): InstanceableType<T & U>
	new (init: T): T
}

export function instanceableType<This extends Obj = {}>() {
	const THIS = class {
		static [" __is_intersection__ "] = false
		static [" __intersections__ "] = new Set<InstanceableType<any>>()
		static [Symbol.hasInstance]<T extends typeof this["prototype"]>(value: T): boolean {
			if (this[" __is_intersection__ "]) {
				for (const intersection of this[" __intersections__ "]) if (!(value instanceof intersection)) return false
				return true
			}
			return value?.constructor === this || (value?.constructor as InstanceableType<any>)[" __intersections__ "]?.has(this as any)
		}
		static intersect<Other extends Obj>(other: InstanceableType<Other>) {
			const NEW = instanceableType<This & Other>()
			NEW[" __is_intersection__ "] = true
			NEW[" __intersections__ "].add(this)
			this[" __intersections__ "].forEach((intersection) => NEW[" __intersections__ "].add(intersection))
			NEW[" __intersections__ "].add(other)
			other[" __intersections__ "].forEach((intersection) => NEW[" __intersections__ "].add(intersection))
			return NEW
		}

		constructor(init: This) {
			Object.assign(this, init)
			bindMethods(this)
		}
	}

	return THIS as any as InstanceableType<This>
}
