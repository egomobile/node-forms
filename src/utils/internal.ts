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

import JSON5 from "json5";
import { Optional } from "../types/internal";

export interface IXmlAttrib {
    name: string;
    value: any;
}

export function cloneObj<T>(obj: any): T {
    return JSON5.parse<T>(
        JSON.stringify(obj)
    );
}

export function getXmlAttribValue(name: string, val: any): IXmlAttrib {
    let newAttribName = name;
    let newAttribValueType = "";
    let newValue = val;

    const sep = name.lastIndexOf(":");
    if (sep > -1) {
        newAttribName = name.substring(0, sep);
        newAttribValueType = name.substring(sep + 1).toLowerCase().trim();

        if (newAttribValueType === "number") {
            newValue = Number(String(newValue).trim());
        }
        else if (newAttribValueType === "boolean") {
            newValue = Boolean(String(newValue).trim());
        }
        else if (newAttribValueType === "bigint") {
            newValue = BigInt(String(newValue).trim());
        }
        else if (newAttribValueType === "symbol") {
            newValue = Symbol(String(newValue).trim());
        }
        else if (newAttribValueType === "object") {
            const jsonStr = String(val).trim();

            newValue = jsonStr.length ? JSON5.parse(jsonStr) : undefined;
        }
        else if (newAttribValueType === "string") {
            newValue = String(val);
        }
    }

    return {
        "name": newAttribName,
        "value": newValue
    };
}

export function isNil(val: any): val is (null | typeof undefined) {
    return typeof val === "undefined" ||
        val === null;
}

export function toXmlAttrib(name: string, val: any): Optional<IXmlAttrib> {
    if (isNil(val)) {
        return;
    }

    const type = typeof val;

    switch (type) {
        case "boolean":
        case "number":
        case "bigint":
        case "symbol":
            return {
                "name": `${name}:${type}`,
                "value": String(val)
            };

        case "function":
            return toXmlAttrib(name, val());

        case "object":
            return {
                "name": `${name}:${type}`,
                "value": JSON.stringify(val)
            };

        default:
            return {
                "name": `${name}:string`,
                "value": String(val)
            };
    }
}
