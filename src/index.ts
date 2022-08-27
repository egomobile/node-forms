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

import type { FormValidator, IForm, IFormValidatorResultItem } from "./types";
import { isNil } from "./utils/internal";
import { createAjv } from "./utils";

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

export * from "./schemas";
export * from "./types";
export * from "./utils";
