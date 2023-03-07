type Obj = Record<string | number | symbol, any>

export namespace CompositionTypeSymbols {
	export const intersections = Symbol()
}

export type CompositionTypeIntersectionBuilder<This extends Obj> = {
	intersect<Other extends Obj>(other: CompositionType<Other>): CompositionTypeIntersectionBuilder<This & Other>
	$(): CompositionType<This>
}

const _ = Symbol("internal")
type _ = typeof _
export type CompositionType<This extends Obj> = {
	[CompositionTypeSymbols.intersections]: Set<CompositionType<any>>
	[Symbol.hasInstance]<T extends This>(value: T): value is This
	new (_: _): This
	"new"<Init extends Obj>(init: This extends Init ? Init : never): This
}

export function compositionTypeOf(value: unknown): CompositionType<any> | null {
	return instanceTypeMap.get(value) ?? null
}

const instanceTypeMap = new WeakMap<any, CompositionType<any>>()
export const compositionType: {
	<This extends Obj = {}>(): CompositionType<This>
	<This extends Obj>(from: CompositionType<This>): CompositionTypeIntersectionBuilder<This>
} = <This extends Obj>(from?: CompositionType<This>) => {
	const type = {
		new(init) {
			if (instanceTypeMap.has(init)) throw new Error("Object already has an CompositionType")
			instanceTypeMap.set(init, type)
			return init
		},
	} as CompositionType<This>

	if (from) {
		type[CompositionTypeSymbols.intersections] = new Set<CompositionType<This>>(from[CompositionTypeSymbols.intersections]).add(from)
		Object.defineProperty(type, Symbol.hasInstance, {
			value: <T extends This>(value: T): value is This => {
				for (const intersection of type[CompositionTypeSymbols.intersections]) if (!(value instanceof intersection)) return false
				return true
			},
		})

		const intersectionBuilder: CompositionTypeIntersectionBuilder<This> = {
			intersect<Other extends Obj>(other: CompositionType<Other>) {
				type[CompositionTypeSymbols.intersections].add(other)
				other[CompositionTypeSymbols.intersections].forEach((intersection) => type[CompositionTypeSymbols.intersections].add(intersection))
				return intersectionBuilder
			},
			$() {
				return type
			},
		}

		return intersectionBuilder as never
	}

	type[CompositionTypeSymbols.intersections] = new Set()
	Object.defineProperty(type, Symbol.hasInstance, {
		value: <T extends This>(value: T): boolean => {
			const valueType = instanceTypeMap.get(value)
			return !!(valueType === type || valueType?.[CompositionTypeSymbols.intersections]?.has(type))
		},
	})

	return type as never
}
