import { makeAddInflectorsPlugin } from 'graphile-utils';

export const namePlugin = makeAddInflectorsPlugin(
  {
    getOppositeBaseName(baseName) {
      return (
        {
          // These are the default opposites
          parent: 'child',
          child: 'parent',
          author: 'authored',
          editor: 'edited',
          reviewer: 'reviewed',

          // 👇 Add/customise this line:
          user: ' ',
          project: ' ',
        }[baseName] || null
      );
    },
  },
  true,
);
