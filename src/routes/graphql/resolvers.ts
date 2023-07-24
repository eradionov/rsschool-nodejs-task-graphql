import {
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType, GraphQLSchema,
} from "graphql/type/index.js";
import {PrismaClient, User} from "@prisma/client";
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
import {
    postInputType, postUpdateType,
    profileInputType, profileUpdateType,
    userInputType, userUpdateType
} from "./input-types.js";
import {
    CreatePostInput,
    CreateProfileInput,
    CreateUserInput, ChangePostInput, ChangeProfileInput, ChangeUserInput
} from "./dto-types.js";

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
        deletePost: {
            type: GraphQLBoolean,
            args: {
                id: {type: UUIDType}
            },
            resolve: async (_, args) => {
                try {
                    const {id} = <{id: UUID}>args;
                    await prisma.post.delete({
                        where: {id},
                    });

                    return true;

                } catch (error) {
                    return false;
                }
            },
        },
        deleteProfile: {
            type: GraphQLBoolean,
            args: {
                id: {type: UUIDType}
            },
            resolve: async (_, args) => {
                try {
                    const {id} = <{id: UUID}>args;

                    await prisma.profile.delete({
                        where: {id},
                    });

                    return true;
                } catch (error) {
                    return false;
                }
            },
        },
        deleteUser: {
            type: GraphQLBoolean,
            args: {
                id: {type: UUIDType}
            },
            resolve: async (_, args) => {
                try {
                    const {id} = <{id: UUID}>args;

                    await prisma.user.delete({
                        where: {id},
                    });

                    return true;
                } catch (error) {
                    return false;
                }
            },
        },
        changePost: {
            type: postType,
            args: {
                id: {type: UUIDType},
                dto: {
                    type: postUpdateType
                }
            },
            resolve: async (_, args) => {
                try {
                    const {id, dto} = <{id: UUID, dto: ChangePostInput}>args;
                    return await prisma.post.update({
                        where: {id},
                        data: dto
                    });
                } catch (error) {
                    throw new Error('Failed to update post.');
                }
            },
        },
        changeProfile: {
            type: profileType,
            args: {
                id: {type: UUIDType},
                dto: {
                    type: profileUpdateType
                }
            },
            resolve: async (_, args) => {
                try {
                    const {id, dto} = <{id: UUID, dto: ChangeProfileInput}>args;
                    return await prisma.profile.update({
                        where: {id},
                        data: dto
                    });
                } catch (error) {
                    throw new Error('Failed to update profile.');
                }
            },
        },
        changeUser: {
            type: userType,
            args: {
                id: {type: UUIDType},
                dto: {
                    type: userUpdateType
                }
            },
            resolve: async (_, args) => {
                try {
                    const {id, dto} = <{id: UUID, dto: ChangeUserInput}>args;
                    return await prisma.user.update({
                        where: {id},
                        data: dto
                    });
                } catch (error) {
                    throw new Error('Failed to update user.');
                }
            },
        },
        subscribeTo: {
            type: new GraphQLList(userType),
            args: {
                userId: {type: UUIDType},
                authorId: {type: UUIDType}
            },
            resolve: async (_, args) => {
                try {
                    const {userId, authorId} = <{userId: UUID, authorId: UUID}>args;

                    await prisma.subscribersOnAuthors.create({
                        data: {subscriberId: userId, authorId: authorId},
                    });
                    const user = await prisma.user.findUnique({
                        where:{
                            id: authorId,
                        },
                    });

                    return [user];
                } catch (error) {
                    throw new Error('Failed to create subscription.');
                }
            },
        },
        unsubscribeFrom: {
            type: GraphQLBoolean,
            args: {
                userId: {type: UUIDType},
                authorId: {type: UUIDType}
            },
            resolve: async (_, args) => {
                try {
                    const {userId, authorId} = <{userId: UUID, authorId: UUID}>args;

                    await prisma.subscribersOnAuthors.deleteMany({
                        where: {subscriberId: userId, authorId: authorId}
                    });

                    return true;
                } catch (error) {
                    return false;
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