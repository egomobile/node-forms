// This file is part of the @egomobile/forms distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/forms is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/forms is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import type { JSONSchema4 } from "json-schema";
import { cloneObj } from "../utils/internal";

const formComponentPropsSchemaStatic: JSONSchema4 = {
    "type": "object",
    "additionalProperties": true,
    "minProperties": 0
};

const formComponentChildrenSchemaStatic: JSONSchema4 = {
    "type": "array",
    "items": undefined
};

const formComponentSchemaStatic: JSONSchema4 = {
    "type": "object",
    "required": ["class"],
    "additionalProperties": false,
    "properties": {
        "class": {
            "type": "string"
        },
        "children": {
            "oneOf": [{
                "type": "null"
            }, formComponentChildrenSchemaStatic]
        },
        "name": {
            "oneOf": [{
                "type": "null"
            }, {
                "type": "string"
            }]
        },
        "props": {
            "oneOf": [{
                "type": "null"
            }, {
                ...cloneObj(formComponentPropsSchemaStatic)
            }]
        }
    }
};

const formComponentChildSchema: JSONSchema4 = {
    "oneOf": [{
        "type": "null"
    }, {
        "type": "string"
    }, {
        ...cloneObj(formComponentSchemaStatic)
    }]
};

Object.defineProperty(formComponentChildrenSchemaStatic, "items", {
    "get": () => {
        return formComponentChildSchema;
    },
    "enumerable": true,
    "configurable": true
});

const formSchemaSchemaStatic: JSONSchema4 = {
    "oneOf": [{
        "type": "null"
    }, {
        "type": "object",
        "additionalProperties": true,
        "minProperties": 0
    }]
};

const formSchemaStatic: JSONSchema4 = {
    "type": "object",
    "required": [
        "components",
        "version"
    ],
    "additionalProperties": false,
    "properties": {
        "components": {
            "type": "array",
            "items": {
                ...cloneObj(formComponentSchemaStatic)
            }
        },
        "version": {
            "type": "string"
        },
        "schema": {
            ...cloneObj(formSchemaSchemaStatic)
        }
    }
};


/**
 * Creates a new object, describing an `IFormComponent` as JSON schema.
 *
 * @returns {JSONSchema4} The new object.
 */
export function formComponentChildJsonSchema(): JSONSchema4 {
    return cloneObj(formComponentChildrenSchemaStatic);
}

/**
 * Creates a new object, describing an `IFormComponent` as JSON schema.
 *
 * @returns {JSONSchema4} The new object.
 */
export function formComponentJsonSchema(): JSONSchema4 {
    return cloneObj(formComponentSchemaStatic);
}

/**
 * Creates a new object, describing a `FormComponentProps` as JSON schema.
 *
 * @returns {JSONSchema4} The new object.
 */
export function formComponentPropsJsonSchema(): JSONSchema4 {
    return cloneObj(formComponentPropsSchemaStatic);
}

/**
 * Creates a new object, describing an `IForm` as JSON schema.
 *
 * @returns {JSONSchema4} The new object.
 */
export function formJsonSchema(): JSONSchema4 {
    return cloneObj(formSchemaStatic);
}

/**
 * Creates a new object, describing aå `FormSchema` as JSON schema.
 *
 * @returns {JSONSchema4} The new object.
 */
export function formSchemaJsonSchema(): JSONSchema4 {
    return cloneObj(formSchemaSchemaStatic);
}
