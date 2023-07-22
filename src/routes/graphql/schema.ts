import {
    GraphQLBoolean, GraphQLEnumType,
    GraphQLFloat, GraphQLID, GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType, GraphQLSchema,
    GraphQLString
} from "graphql/type/index.js";
import {PrismaClient, Profile, SubscribersOnAuthors, User} from "@prisma/client";
import {UUIDType} from "./types/uuid.js";
import {UUID} from "crypto";
import {MemberTypeId as MemberTypeEnumId} from "../member-types/schemas.js";

const prisma = new PrismaClient();

const MemberTypeId = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
        basic: { value: 'basic' },
        business: { value: 'business' }
    },
});

const memberType: GraphQLObjectType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
        id: { type: MemberTypeId },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
        profiles: { type: new GraphQLList(profileType) }
    }),
});
const profileType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        user: { type: new GraphQLNonNull(userType) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
        memberType: {
            type: memberType,
            resolve: async (parent: Profile, _) => {
                try {
                    return await prisma.memberType.findUnique({
                        where: {id: parent.memberTypeId},
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to create user.');
                }
            },

        },
        memberTypeId: { type: MemberTypeId },
    }),
});

const userType: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: { type: profileType },
        posts: { type: new GraphQLList(postType) },
        userSubscribedTo: {
            type: new GraphQLList(authorSubscriberType)
        },
        subscribedToUser: {
            type: new GraphQLList(authorSubscriberType)
        }
    }),
});

const authorSubscriberType: GraphQLObjectType = new GraphQLObjectType({
    name: 'SubscribersOnAuthors',
    fields: () => ({
        subscribedToUser: {type: new GraphQLNonNull(userType)},
        subscribedToUserId: { type: new GraphQLNonNull(UUIDType) },
        userSubscribedTo: { type: new GraphQLNonNull(userType) },
        userSubscribedToId: { type: new GraphQLNonNull(UUIDType) }
    }),
});


const postType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        author:  {type: new GraphQLNonNull(userType)},
        authorId: {type: new GraphQLNonNull(GraphQLString)},
    }),
});


const queryType: GraphQLObjectType = new GraphQLObjectType({
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

const mutationType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        user: {
            type: userType,
            args: {
              name: {type: new GraphQLNonNull(GraphQLString)},
              balance: {type: new GraphQLNonNull(GraphQLFloat)}
            },
            resolve: async (_, args) => {
                try {
                    const {name, balance} = <{name: string, balance: number}>args;
                    return await prisma.user.create({
                        data: {name, balance},
                    });
                } catch (error) {
                    console.error(error);
                    throw new Error('Failed to create user.');
                }
            },
        }
    },
});

const subscriptionType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Subscription',
    fields: () => ({
        subscriber: async (parent: User) => {
            try {
                const subscription = await prisma.subscribersOnAuthors.findMany({
                    where: {
                        subscriberId: parent.id,
                    },
                });

                if (!subscription) {
                    throw new Error('Subscription not found');
                }

                return prisma.user.findMany({
                    where: {
                        id: subscription[0].subscriberId,
                    },
                });
            } catch (error) {
                console.error(error);
                throw new Error('Failed to fetch subscriber information');
            }
        },
        author: async (parent: User) => {
            const subscription = await prisma.subscribersOnAuthors.findMany({
                where: {
                    authorId: parent.id,
                },
            });

            if (!subscription) {
                throw new Error('Subscription not found');
            }

            return prisma.user.findMany({
                where: {
                    id: subscription[0].subscriberId,
                },
            });
        },
    }),
});

export const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
    subscription: subscriptionType
});