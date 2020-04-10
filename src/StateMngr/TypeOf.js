const TypeOf = inst => {
    if (!inst.constructor) {
        // return typeof initType
        return 'undefined without constructor'
    } else {
        switch (inst.constructor) {
            case Object:
                return 'object'
            case Array:
                return 'array'
            case String:
                return 'string'
            case Number:
                return 'number'
            case Boolean:
                return 'boolean'
            default:
                // return initType.constructor
                return 'undefined'
        }

    }
}

export default TypeOf