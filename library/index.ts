type Obj = Record<string | number | symbol, any>

export namespace InstanceableSymbols {
	export const intersections = Symbol()
}

export type InstanceableTypeIntersectionBuilder<This extends Obj> = {
	intersect<Other extends Obj>(other: InstanceableType<Other>): InstanceableTypeIntersectionBuilder<This & Other>
	$(): InstanceableType<This>
}

export type InstanceableTypeConstructor<This extends Obj> = {
	<Init extends Obj>(init: This extends Init ? This : never): This
}

export type InstanceableTypeMethods<This extends Obj> = {
	[InstanceableSymbols.intersections]: Set<InstanceableType<any>>
	[Symbol.hasInstance]<T extends This>(value: T): boolean
}

export type InstanceableType<This extends Obj> = InstanceableTypeMethods<This> & InstanceableTypeConstructor<This>

export type InstanceableInstanceType<T extends InstanceableType<any>> = T extends InstanceableType<infer U> ? U : never

const instanceTypeMap = new WeakMap<any, InstanceableType<any>>()
export const instanceableType: {
	<This extends Obj>(): InstanceableType<This>
	<This extends Obj>(intersect: InstanceableType<This>): InstanceableTypeIntersectionBuilder<This>
} = <This extends Obj>(intersect?: InstanceableType<This>) => {
	const constructor: InstanceableTypeConstructor<This> = (init) => {
		instanceTypeMap.set(init, type)
		return init
	}

	const type = constructor as InstanceableType<This>

	if (intersect) {
		const intersections = new Set<InstanceableType<This>>(intersect[InstanceableSymbols.intersections])
		intersections.add(intersect)
		type[InstanceableSymbols.intersections] = intersections
		Object.defineProperty(type, Symbol.hasInstance, {
			value: <T extends This>(value: T) => {
				for (const intersection of type[InstanceableSymbols.intersections]) if (!(value instanceof intersection)) return false
				return true
			},
		})

		const intersectionBuilder: InstanceableTypeIntersectionBuilder<This> = {
			intersect<Other extends Obj>(other: InstanceableType<Other>) {
				intersections.add(other)
				other[InstanceableSymbols.intersections].forEach((intersection) => intersections.add(intersection))
				return intersectionBuilder
			},
			$() {
				return type
			},
		}

		return intersectionBuilder as never
	}

	type[InstanceableSymbols.intersections] = new Set()
	Object.defineProperty(type, Symbol.hasInstance, {
		value: <T extends This>(value: T) => {
			const valueType = instanceTypeMap.get(value)
			return valueType === type || valueType?.[InstanceableSymbols.intersections]?.has(type)
		},
	})

	return type as never
}
