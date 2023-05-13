import { GraphQLScalarType } from 'graphql';

// После shema stiching возникает known issue: ‘Upload’ scalar serialization unsupported.
// https://github.com/jaydenseric/graphql-upload/issues/144
// Переопределение этого типа решает проблему

export const GraphQLUpload = new GraphQLScalarType({
  name: 'Upload',
  description: 'The `Upload` scalar type represents a file upload.',
  parseValue: (value) => (value.promise ? value.promise : value),
  serialize: (value) => value,

  parseLiteral() {
    throw new Error('‘Upload’ scalar literal unsupported.');
  },
});
