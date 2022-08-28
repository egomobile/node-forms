[![npm](https://img.shields.io/npm/v/@egomobile/forms.svg)](https://www.npmjs.com/package/@egomobile/forms)
[![last build](https://img.shields.io/github/workflow/status/egomobile/node-forms/Publish)](https://github.com/egomobile/node-forms/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-forms/pulls)

# @egomobile/forms

> Types and helpers, handling forms and their data.

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/forms
```

## Usage

```typescript
import { compileFormValidator, IForm } from "../src";

const form: IForm = {
  version: "1",
  components: [
    {
      class: "ETextField",
      name: "lastname",
      props: {
        label: "Last name",
      },
    },
    {
      class: "ETextField",
      name: "firstname",
      props: {
        label: "First name",
      },
    },
  ],
  schema: {
    format: "ajv",
    config: {
      type: "object",
      required: ["lastname", "firstname"],
      properties: {
        firstname: {
          type: "string",
        },
        lastname: {
          type: "string",
        },
      },
    },
  },
};

async function main() {
  const validate = compileFormValidator(form);

  // should return 1 error
  // because `firstname` has no value
  const validationResult = validate({
    lastname: "Doe",
  });

  console.log(validationResult);
}

main().catch(console.error);
```

## Credits

The module makes use of:

- [Ajv](https://github.com/ajv-validator/ajv)
- [ajv-formats](https://github.com/ajv-validator/ajv-formats)
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- [json-schema](https://www.npmjs.com/package/json-schema)

## Documentation

The API documentation can be found [here](https://egomobile.github.io/node-forms/).
