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

import { XMLBuilder, XMLParser } from "fast-xml-parser";
import type { FormComponentChild, FormValidator, IForm, IFormComponent, IFormValidatorResultItem } from "./types";
import { isNil } from "./utils/internal";
import { createAjv } from "./utils";

const baseXmlOptions = {
    "ignoreAttributes": false,
    "preserveOrder": true,
    "attributeNamePrefix": ""
};
const defaultFormVersion = "1";
const schemaXmlTagName = "schema";
const specialXmlAttribPrefix = "@";
const xmlAttribKey = ":@";
const xmlNameAttrib = specialXmlAttribPrefix + "name";
const xmlFormRootTagName = "e-form";
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
        ...baseXmlOptions,
        "allowBooleanAttributes": true
    });
    const jObj = parser.parse(xml);

    const rootTag = jObj[0]?.[xmlFormRootTagName];
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

/**
 * Converts an `IForm` to a XML string.
 *
 * @param {IForm} form The input form.
 *
 * @returns {string} The XML string.
 */
export function toXml(form: IForm): string {
    const rootTag: any[] = [];
    const rootAttribs: any = {
        "version": form.version
    };

    const collectChildComponents = (component: FormComponentChild, tag: any[]) => {
        if (!component) {
            return;
        }

        if (typeof component === "string") {
            tag.push({
                [xmlTextKey]: component
            });
        }
        else {
            const attribs: any = {
                ...(component.props || {})
            };

            if (component?.name?.length) {
                attribs["@name"] = component.name;
            }

            const componentChildren: any[] = [];

            const childTag: any[] = [{
                [component.class]: componentChildren,
                [xmlAttribKey]: attribs
            }];

            if (component.children?.length) {
                for (const child of component.children) {
                    collectChildComponents(child, componentChildren);
                }
            }

            tag.push(...childTag);
        }
    };

    for (const component of form.components) {
        collectChildComponents(component, rootTag);
    }

    if (form.schema) {
        rootTag.push({
            [schemaXmlTagName]: [{
                [xmlTextKey]: JSON.stringify(form.schema.config || {}, null, 2)
            }],

            [xmlAttribKey]: {
                "format": form.schema.format
            }
        });
    }

    const jObj: any[] = [{
        [xmlFormRootTagName]: rootTag,
        [xmlAttribKey]: rootAttribs
    }];

    const builder = new XMLBuilder({
        ...baseXmlOptions,
        "suppressEmptyNode": false,
        "suppressBooleanAttributes": false,
        "format": true
    });

    return builder.build(jObj);
}

export * from "./schemas";
export * from "./types";
export * from "./utils";
