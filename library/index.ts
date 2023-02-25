type Obj = Record<string | number | symbol, any>

export namespace InstanceableSymbols {
	export const isIntersection = Symbol()
	export const intersections = Symbol()
	export const type = Symbol()
}

export type InstanceableTypeIntersector<This extends Obj> = {
	intersect<Other extends Obj>(other: InstanceableType<Other>): InstanceableTypeIntersector<This & Other>
	$(): InstanceableType<This>
}

export type InstanceableTypeConstructor<This extends Obj> = {
	<Init extends Obj>(init: This extends Init ? This : never): This
}

export type InstanceableTypeMethods<This extends Obj> = {
	[InstanceableSymbols.isIntersection]: boolean
	[InstanceableSymbols.intersections]: Set<InstanceableType<any>>
	[Symbol.hasInstance]<T extends This>(value: T): boolean
	intersect<Other extends Obj>(other: InstanceableType<Other>): InstanceableTypeIntersector<This & Other>
}

export type InstanceableType<This extends Obj> = InstanceableTypeMethods<This> & InstanceableTypeConstructor<This>

type InternalThis<This extends Obj> = This & {
	[InstanceableSymbols.type]: InstanceableType<This>
}

export function instanceableType<This extends Obj = {}>() {
	const constructor: InstanceableTypeConstructor<This> = (init) => {
		;(init as any as InternalThis<This>)[InstanceableSymbols.type] = type
		return init
	}

	const type = constructor as InstanceableType<This>

	type[InstanceableSymbols.intersections] = new Set()
	Object.defineProperty(type, Symbol.hasInstance, {
		value: <T extends This>(value: T) => {
			if (type[InstanceableSymbols.isIntersection]) {
				for (const intersection of type[InstanceableSymbols.intersections]) if (!(value instanceof intersection)) return false
				return true
			}
			return (
				(value as InternalThis<any>)?.[InstanceableSymbols.type] === type ||
				(value as InternalThis<T>)?.[InstanceableSymbols.type]?.[InstanceableSymbols.intersections]?.has(type)
			)
		},
	})
	type.intersect = <Other extends Obj>(other: InstanceableType<Other>): InstanceableTypeIntersector<This & Other> => {
		const NEW = instanceableType<This & Other>()
		NEW[InstanceableSymbols.isIntersection] = true
		const intersectionsOfNEW = NEW[InstanceableSymbols.intersections]
		intersectionsOfNEW.add(type)
		type[InstanceableSymbols.intersections].forEach((intersection) => intersectionsOfNEW.add(intersection))
		intersectionsOfNEW.add(other)
		other[InstanceableSymbols.intersections].forEach((intersection) => intersectionsOfNEW.add(intersection))

		const intersector = {
			intersect<Other extends Obj>(other: InstanceableType<Other>) {
				intersectionsOfNEW.add(other)
				other[InstanceableSymbols.intersections].forEach((intersection) => intersectionsOfNEW.add(intersection))
				return intersector
			},
			$() {
				return NEW
			},
		}

		return intersector as InstanceableTypeIntersector<This & Other>
	}

	return type
}
