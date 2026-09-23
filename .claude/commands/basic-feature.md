---
description: Create a new $ARGUMENTS feature
---

## Folder structure:
$ARGUMENTS/
----`$ARGUMENTS`.controller.ts
----`$ARGUMENTS`.entity.ts
----`$ARGUMENTS`.module.ts
----`$ARGUMENTS`.service.ts
----dto/
--------create-`$ARGUMENTS`.dto.ts
--------update-`$ARGUMENTS`.dto.ts
----mappers/
--------to-public-`$ARGUMENTS`.ts
----types/
--------`$ARGUMENTS`.ts

## Implementation plan
You should create a new $ARGUMENTS feature with next things:
1. Feature folder
    - Controller
    - Entity
    - Module
    - Service
2. Dto folder (used for create/update feature and all other feature scoped DTOs)
    - Create dto
    - Update dto (if needed)
3. Mappers (e.g. [to-public-user.ts](/src/modules/user/mappers/to-public-user.ts))
4. Types
