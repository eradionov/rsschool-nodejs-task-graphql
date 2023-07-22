import {
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType, GraphQLSchema,
} from "graphql/type/index.js";
import {PrismaClient} from "@prisma/client";
import {UUIDType} from "./types/uuid.js";
import {UUID} from "crypto";
import {MemberTypeId as MemberTypeEnumId} from "../member-types/schemas.js";
import {
    memberType,
    postType,
    profileType,
    userType,
    MemberTypeId,
    authorSubscriberType
} from "./schema-types.js";
import {randomUUID} from "node:crypto";
import {postInputValidator, profileInputValidator, userInputValidator} from "./validator.js";
import {InvalidArgumentException} from "./Exception/invalid_argument.js";
import {postInputType, profileInputType, userInputType} from "./input-types.js";
import {CreatePostInput, CreateProfileInput, CreateUserInput} from "./dto-types.js";

const prisma = new PrismaClient();

const queryRoot: GraphQLObjectType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        user: {
            type: userType,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (_, args) => {
                try {
                    const {id} = <{id: UUID}>args;
                    return await prisma.user.findUnique({
                        where: {id},
                        include: { profile: true, posts: true, userSubscribedTo: true, subscribedToUser: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to create user.');
                }
            },
        },
        users: {
            type: new GraphQLList(userType),
            resolve: async () => {
                try {
                    return await prisma.user.findMany({
                        include: { profile: true, posts: true, userSubscribedTo: true, subscribedToUser: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to fetch users.');
                }
            },
        },
        post: {
            type: postType,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (_, args) => {
                try {
                    const {id} = <{id: UUID}>args;
                    return await prisma.post.findUnique({
                        where: {id},
                        include: { author: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to fetch post.');
                }
            },
        },
        posts: {
            type: new GraphQLList(postType),
            resolve: async () => {
                try {
                    return await prisma.post.findMany({
                        include: { author: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to fetch posts.');
                }
            },
        },
        profile: {
            type: profileType,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (_, args) => {
                try {
                    const {id} = <{id: UUID}>args;
                    return await prisma.profile.findUnique({
                        where: {id},
                        include: { user: true, memberType: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to fetch profile.');
                }
            },
        },
        profiles: {
            type: new GraphQLList(profileType),
            resolve: async () => {
                try {
                    return await prisma.profile.findMany({
                        include: { user: true, memberType: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to fetch profiles.');
                }
            },
        },
        memberType: {
            type: memberType,
            args: {
                id: {type: MemberTypeId}
            },
            resolve: async (_, args) => {
                try {
                    const {id} = <{id: MemberTypeEnumId}>args;
                    return await prisma.memberType.findUnique({
                        where: {id},
                        include: { profiles: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to fetch memberType.');
                }
            },
        },
        memberTypes: {
            type: new GraphQLList(memberType),
            resolve: async () => {
                try {
                    return await prisma.memberType.findMany({
                        include: { profiles: true },
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to fetch memberTypes.');
                }
            },
        },
    },
});

const mutationRoot: GraphQLObjectType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        createUser: {
            type: userType,
            args: {
                dto: {
                    type: userInputType
                }
            },
            resolve: async (_, args: { dto: CreateUserInput }) => {
                try {
                    userInputValidator(args.dto);

                    const {name, balance} = args.dto;

                    return await prisma.user.create({
                        data: {id: randomUUID(), name, balance},
                    });
                } catch (error) {
                    if (error instanceof InvalidArgumentException) {
                        throw error;
                    }

                    throw new Error('Failed to create user.');
                }
            },
        },
        createProfile: {
            type: profileType,
            args: {
                dto: {
                    type: profileInputType
                }
            },
            resolve: async (_, args: { dto: CreateProfileInput }) => {
                try {
                    profileInputValidator(args.dto);

                    const {isMale, yearOfBirth, userId, memberTypeId} = args.dto;

                    const user = await prisma.user.findUnique({
                        where: {id: userId},
                    });

                    if (null === user) {
                        throw new InvalidArgumentException(`user with id ${userId} does not exist`);
                    }

                    return await prisma.profile.create({
                        data: {id: randomUUID(), isMale, yearOfBirth, userId, memberTypeId},
                    });
                } catch (error) {
                    if (error instanceof InvalidArgumentException) {
                        throw error;
                    }

                    throw new Error('Failed to create profile.');
                }
            },
        },
        createPost: {
            type: postType,
            args: {
                dto: {
                    type: postInputType
                }
            },
            resolve: async (_, args: { dto: CreatePostInput }) => {
                try {
                    postInputValidator(args.dto);

                    const {authorId, content, title} = args.dto;

                    const user = await prisma.user.findUnique({
                        where: {id: authorId},
                    });

                    if (null === user) {
                        throw new InvalidArgumentException(`user with id ${authorId} does not exist`);
                    }

                    return await prisma.post.create({
                        data: {id: randomUUID(), authorId, content, title},
                    });
                } catch (error) {
                    if (error instanceof InvalidArgumentException) {
                        throw error;
                    }

                    throw new Error('Failed to create post.');
                }
            },
        },
    },
});

export const schema = new GraphQLSchema({
    query: queryRoot,
    mutation: mutationRoot,
    subscription: authorSubscriberType
});