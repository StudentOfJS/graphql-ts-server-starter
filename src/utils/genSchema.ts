import * as path from 'path'
import * as glob from 'glob'
import { readFileSync } from 'fs'
import { makeExecutableSchema } from 'graphql-tools'
import { mergeTypes, mergeResolvers } from 'merge-graphql-schemas'

export const genSchema = () => {
  const pathToModules = path.join(__dirname, "../modules")
  const graphqlTypes = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map(x => readFileSync(x, { encoding: "utf8" }))

  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map(resolver => require(resolver).resolvers)
  return makeExecutableSchema({
    typeDefs: mergeTypes(graphqlTypes),
    resolvers: mergeResolvers(resolvers)
  })
}