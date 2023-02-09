function bindMethods<T extends object>(obj: T): T {
	for (const key of Object.getOwnPropertyNames(obj.constructor.prototype)) {
		const descriptor = Object.getOwnPropertyDescriptor(obj, key)
		if (descriptor?.value instanceof Function) Object.defineProperty(obj, key, { ...descriptor, value: descriptor.value.bind(obj) })
	}
	return obj
}

type Obj = Record<string, any>
class Instr<T extends Obj> {
	constructor(obj: T) {
		Object.assign(this, obj)
		bindMethods(this)
	}
}
export type Instancer<T extends Obj> = { new (obj: T): T }

export function instancer<This extends Obj>() {
	return <Base extends Obj = Obj>(base: Instancer<Base> | Instancer<This> = Instr<This> as Instancer<This>) =>
		class extends base {} as Instancer<This & (Obj extends Base ? {} : Base)>
}
