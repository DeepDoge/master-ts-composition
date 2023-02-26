type Obj = Record<string | number | symbol, any>

export namespace InstanceableSymbols {
	export const intersections = Symbol()
}

export type InstanceableTypeIntersectionBuilder<This extends Obj> = {
	intersect<Other extends Obj>(other: InstanceableType<Other>): InstanceableTypeIntersectionBuilder<This & Other>
	$(): InstanceableType<This>
}

/* const InternalMethod = Symbol("internal")
type DontUseNewKeyword = typeof InternalMethod */
export type InstanceableType<This extends Obj> = {
	[InstanceableSymbols.intersections]: Set<InstanceableType<any>>
	[Symbol.hasInstance]<T extends This>(value: T): value is This
	new (): This
	"new"<Init extends Obj>(init: This extends Init ? This : never): This
}

export function instanceableTypeOf(value: unknown): InstanceableType<Obj> | null {
	return instanceTypeMap.get(value) ?? null
}

const instanceTypeMap = new WeakMap<any, InstanceableType<any>>()
export const instanceableType: {
	<This extends Obj>(): InstanceableType<This>
	<This extends Obj>(from: InstanceableType<This>): InstanceableTypeIntersectionBuilder<This>
} = <This extends Obj>(from?: InstanceableType<This>) => {
	const type = {
		new(init) {
			instanceTypeMap.set(init, type)
			return init
		},
	} as InstanceableType<This>

	if (from) {
		type[InstanceableSymbols.intersections] = new Set<InstanceableType<This>>(from[InstanceableSymbols.intersections]).add(from)
		Object.defineProperty(type, Symbol.hasInstance, {
			value: <T extends This>(value: T): value is This => {
				for (const intersection of type[InstanceableSymbols.intersections]) if (!(value instanceof intersection)) return false
				return true
			},
		})

		const intersectionBuilder: InstanceableTypeIntersectionBuilder<This> = {
			intersect<Other extends Obj>(other: InstanceableType<Other>) {
				type[InstanceableSymbols.intersections].add(other)
				other[InstanceableSymbols.intersections].forEach((intersection) => type[InstanceableSymbols.intersections].add(intersection))
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
		value: <T extends This>(value: T): boolean => {
			const valueType = instanceTypeMap.get(value)
			return !!(valueType === type || valueType?.[InstanceableSymbols.intersections]?.has(type))
		},
	})

	return type as never
}
