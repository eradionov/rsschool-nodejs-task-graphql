import {
    GraphQLBoolean, GraphQLFloat,
    GraphQLInputObjectType, GraphQLInt,
    GraphQLNonNull, GraphQLString,
} from "graphql/type/index.js";
import {UUIDType} from "./types/uuid.js";
import {MemberTypeId} from "./schema-types.js";

export const profileInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: () => ({
        userId: {type: new GraphQLNonNull(UUIDType)},
        isMale: {type: new GraphQLNonNull(GraphQLBoolean)},
        yearOfBirth: {type: new GraphQLNonNull(GraphQLInt)},
        memberTypeId: {type: new GraphQLNonNull(MemberTypeId)}
    })
});

export const userInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
        name: {type: new GraphQLNonNull(GraphQLString)},
        balance: {type: new GraphQLNonNull(GraphQLFloat)}
    })
});

export const postInputType: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: () => ({
        authorId: {type: new GraphQLNonNull(UUIDType)},
        content: {type: new GraphQLNonNull(GraphQLString)},
        title: {type: new GraphQLNonNull(GraphQLString)}
    })
});

export const postUpdateType: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: () => ({
        title: {type: new GraphQLNonNull(GraphQLString)}
    })
});

export const profileUpdateType: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
        isMale: {type: GraphQLBoolean},
    })
});

export const userUpdateType: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: () => ({
        name: {type: new GraphQLNonNull(GraphQLString)}
    })
});