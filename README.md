# tscopy

Copy a typescript project from somewhere to otherwhere. Just like `cp` but patch `import` syntaxes.

复制一个 typescript 工程到另一个文件夹。就像 `cp` 命令一样，不过会自动处理其中的 `import` 语法。

### Install

`npm i -g tscopy`

### Usage

`tscopy ./zph/myproject ./zph/hisproject/src/submodule/myproject [--ignore=node_modules,package.json]`

We will `mkdir ./zph/hisproject/src/submodule/myproject` then put files on `./zph/myproject`

- `ignore`: split with `,`, ignore some files, defaults to `--ignore=node_modules`.

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

After in `./zph/hisproject/src/submodule/myproject/src/index.tsx`:

```tsx
import React from 'react'
import helper from '../../utils/helper'
import CommonTable from './component/CommonTable'
```

### Tips

- We always prefer relative path after transform.
- We don't transform the packages imported in 'node_modules'.
