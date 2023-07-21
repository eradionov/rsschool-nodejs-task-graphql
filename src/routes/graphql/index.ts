import {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {createGqlResponseSchema, gqlResponseSchema} from './schemas.js';
import {graphql} from "graphql/graphql.js";
import {PrismaClient} from "@prisma/client";
import {schema} from './schema.js';

const prisma = new PrismaClient();

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;
      const context = { prisma };

      return await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: context
      });
    },
  });
};

export default plugin;
