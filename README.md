# tscopy

Copy a typescript project from somewhere to otherwhere. Just like `cp` but patch import syntaxes.

### Install

`npm i -g tscopy`

### Usage

`tscopy ./zph/myproject ./zph/hisproject/src/submodule/tsproject`

### Description

The `tsconfig.json` in `./myproject`:

```json
{
  "compilerOptions": {
    "baseUrl": "../zph",
    "paths": {
      "react": "hisproject/node_modules/react",
      "helper": "hisproject/src/utils/helper",
      "myproject/*": "myproject/*",
    }
  }
}
```

Before in `./zph/myproject/src/index.tsx`:

```tsx
import React from 'react'
import helper from 'helper'
import CommonTable from 'myproject/src/component/CommonTable'
```

After in `./zph/hisproject/src/submodule/tsproject/src/index.tsx`:

```tsx
import React from 'react'
import helper from '../../utils/helper'
import CommonTable from './component/CommonTable'
```

### Tips

- We always prefer relative path after transform.
- We don't transform the packages imported in 'node_modules'.