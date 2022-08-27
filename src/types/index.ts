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
import type { Nilable, Nullable } from "./internal";

/**
 * A possible value for a child of an `IFormComponent`.
 */
export type FormComponentChild = Nilable<IFormComponent | string>;

/**
 * Props for an `IFormComponent`.
 */
export type FormComponentProps = Record<string, any>;

/**
 * List of form values.
 */
export type FormValues = Record<string, any>;

/**
 * A function, which validates data for a form.
 *
 * @param {FormValues} values The values.
 *
 * @returns {IFormValidatorResultItem[]} The result.
 */
export type FormValidator = (values: FormValues) => IFormValidatorResultItem[];

/**
 * The type of an `IFormValidatorResultItem`.
 */
export type FormValidatorResultItemType = "error";

/**
 * A possible value for `` prop.
 */
export type FormSchema = IAjvFormSchema;

/**
  * An Ajv based form schema.
  */
export interface IAjvFormSchema {
    /**
     * The configuration.
     */
    config: JSONSchema4;
    /**
     * The format.
     */
    format: "ajv";
}

/**
 * A form.
 */
export interface IForm {
    /**
     * The controls in that form.
     */
    components: IFormComponent[];
    /**
     * The optional schema.
     */
    schema?: Nilable<FormSchema>;
    /**
     * The version.
     */
    version: string;
}

/**
 * A form component.
 */
export interface IFormComponent {
    /**
     * The class / type.
     */
    "class": string;
    /**
     * One or more children.
     */
    children?: Nilable<FormComponentChild[]>;
    /**
     * The name, which can be used to get the value from.
     */
    name?: Nilable<string>;
    /**
     * One or more optional props to setup the component.
     */
    props?: Nilable<FormComponentProps>;
}

/**
 * A result item of a `FormValidator` function.
 */
export interface IFormValidatorResultItem {
    /**
     * The message.
     */
    message: Nullable<string>;
    /**
     * The type.
     */
    type: FormValidatorResultItemType;
}
