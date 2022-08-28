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

import { XMLParser } from "fast-xml-parser";
import type { FormComponentChild, FormValidator, IForm, IFormComponent, IFormValidatorResultItem } from "./types";
import { isNil } from "./utils/internal";
import { createAjv } from "./utils";

const defaultFormVersion = "1";
const schemaXmlTagName = "schema";
const specialXmlAttribPrefix = "@";
const xmlAttribKey = ":@";
const xmlNameAttrib = specialXmlAttribPrefix + "name";
const xmlTextKey = "#text";

/**
 * Creates a validator from a form.
 *
 * @param {IForm} form The form.
 *
 * @returns {FormValidator} The validator.
 */
export function compileFormValidator(form: IForm): FormValidator {
    const { schema } = form;

    if (schema?.config) {
        return (values) => {
            const ajv = createAjv();

            const validate = ajv.compile(schema?.config);
            const isValid = validate(values);

            const result: IFormValidatorResultItem[] = [];
            if (!isValid) {
                validate.errors?.forEach((error) => {
                    result.push({
                        "type": "error",
                        "message": error.message || null
                    });
                });
            }

            return result;
        };
    }
    else {
        // all fields must not be `null` and not `undefined`

        return (values) => {
            const result: IFormValidatorResultItem[] = [];

            Object.entries(values).forEach(([key, value]) => {
                if (isNil(value)) {
                    result.push({
                        "type": "error",
                        "message": `must have required property '${key}'`
                    });
                }
            });

            return result;
        };
    }
}

/**
 * Creates a new `IForm` from XML data.
 *
 * @param {string|object} xmlData The XML data.
 *
 * @returns {IForm} The new form.
 */
export function fromXml(xmlData: string | { toString(): string; }): IForm {
    const xml = String(
        typeof xmlData === "string" ?
            xmlData :
            xmlData.toString()
    );

    const form = {
        "components": [],
        "schema": null,
        "version": defaultFormVersion
    };

    const collectChildComponents = (parent: any[], targetList: FormComponentChild[]) => {
        if (!Array.isArray(parent)) {
            return;
        }

        for (const child of parent) {
            if (typeof child !== "object") {
                continue;
            }

            const entries = Object.entries(child);
            const attribEntry = entries.find(([key, value]) => {
                return key === xmlAttribKey;
            });

            for (const entry of entries) {
                const tagName = entry[0];
                const tagChildren: any = entry[1];

                if (tagName === xmlTextKey) {
                    targetList.push(String(tagChildren));
                }
                else {
                    const isAttributeList = tagName === xmlAttribKey;
                    const isComponent = !isAttributeList &&
                        String(tagName[0]) === tagName[0]?.toUpperCase();

                    if (isComponent) {
                        const newComponent: IFormComponent = {
                            "class": tagName,
                            "children": [],
                            "name": null,
                            "props": {}
                        };

                        if (Array.isArray(attribEntry)) {
                            const attribs: any = attribEntry[1];

                            if (typeof attribs[xmlNameAttrib] === "string") {
                                newComponent.name = attribs[xmlNameAttrib].trim() || null;
                            }

                            for (const [attribName, attribValue] of Object.entries(attribs)) {
                                if (attribName.trim().startsWith(specialXmlAttribPrefix)) {
                                    continue;  // no special attributes
                                }

                                newComponent.props![attribName] = attribValue;
                            }
                        }

                        targetList.push(newComponent);

                        collectChildComponents(tagChildren, newComponent.children as FormComponentChild[]);
                    }
                }
            }
        }
    };

    const parser = new XMLParser({
        "ignoreAttributes": false,
        "allowBooleanAttributes": true,
        "preserveOrder": true,
        "attributeNamePrefix": ""
    });
    const jObj = parser.parse(xml);

    const rootTag = jObj[0]?.["e-form"];
    if (Array.isArray(rootTag)) {
        const rootAttribs = jObj[0]?.[xmlAttribKey];
        const version = rootAttribs?.["version"];

        // <e-form version="..." />
        if (typeof version === "string") {
            form.version = version.trim() || defaultFormVersion;
        }

        // <schema />
        const schemaAttribEntry = rootTag.find((tag) => {
            return Object.entries(tag).some(([key, value]) => {
                return key === schemaXmlTagName;
            });
        });
        if (schemaAttribEntry) {
            const schemaTag = schemaAttribEntry[schemaXmlTagName];
            const textChild = schemaTag.find((tag: any) => {
                return Object.entries(tag).some(([key, value]) => {
                    return key === xmlTextKey;
                });
            });

            if (textChild) {
                if (typeof textChild[xmlTextKey] === "string") {
                    const schemaJson = textChild[xmlTextKey].trim();
                    if (schemaJson.length) {
                        form.schema = JSON.parse(schemaJson);
                    }
                }
            }
        }

        collectChildComponents(rootTag, form.components);
    }

    return form;
}

export * from "./schemas";
export * from "./types";
export * from "./utils";
