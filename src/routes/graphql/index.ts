import {FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox';
import {createGqlResponseSchema, gqlResponseSchema} from './schemas.js';
import {graphql} from "graphql/graphql.js";
import {PrismaClient} from "@prisma/client";
import {schema} from './resolvers.js';
import {specifiedRules, validate} from "graphql/validation/index.js";
import {parse, Source} from "graphql/language/index.js";
import depthLimit from "graphql-depth-limit";

const prisma = new PrismaClient();
const GRAPHQL_QUERY_DEPTH_LIMIT = 5;

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
    async handler(req,reply) {
      const { query, variables } = req.body;
      const context = { prisma };

      const documentAST = parse(new Source(query, 'Request parser'));

      const validationErrors = validate(
          schema,
          documentAST,
          [
            ...specifiedRules,
            depthLimit(GRAPHQL_QUERY_DEPTH_LIMIT)
        ]);

      if (validationErrors.length > 0) {
        await reply.status(500).send({data: null, errors: validationErrors});

        return;
      }

      return await graphql({
        schema: schema,
        source: query,
        variableValues: variables,
        contextValue: context
      });
    },
  });
};

export default plugin;
