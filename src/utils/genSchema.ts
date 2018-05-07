import { importSchema } from 'graphql-import'
import * as path from 'path'
import * as fs from 'fs'
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools'
import { GraphQLSchema } from 'graphql'

export const genSchema = () => {
  const folders = fs.readdirSync(path.join(__dirname, "../modules"))
  const schemas: GraphQLSchema[] = folders.map(folder => {
    const { resolvers } = require(`../modules/${folder}/resolvers`)
    const typeDefs = importSchema(path.join(__dirname, `../modules/${folder}/schema.graphql`))
    return makeExecutableSchema({ resolvers, typeDefs })
  })
  return mergeSchemas({ schemas })
}