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

import Ajv from "ajv";
import addAJVFormats from "ajv-formats";

/**
 * Creates a new pre-setuped `Ajv` instance.
 *
 * @returns {Ajv} The new instance.
 */
export function createAjv(): Ajv {
    const ajv = new Ajv({
        "allErrors": true
    });
    addAJVFormats(ajv);

    return ajv;
}
