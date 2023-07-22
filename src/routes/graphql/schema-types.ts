import {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLFloat,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType, GraphQLString
} from "graphql/type/index.js";
import {UUIDType} from "./types/uuid.js";
import {PrismaClient, Profile, User} from "@prisma/client";

const prisma = new PrismaClient();

export const MemberTypeId = new GraphQLEnumType({
    name: 'MemberTypeId',
    values: {
        basic: { value: 'basic' },
        business: { value: 'business' }
    },
});

export const memberType: GraphQLObjectType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
        id: { type: MemberTypeId },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
        profiles: { type: new GraphQLList(profileType) }
    }),
});
export const profileType: GraphQLObjectType = new GraphQLObjectType({
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

export const userType: GraphQLObjectType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: { type: profileType },
        posts: { type: new GraphQLList(postType) },
        userSubscribedTo: {
            type: new GraphQLList(userType),
            resolve: async (parent: User) => {
                const subscribedOn =  await prisma.subscribersOnAuthors.findMany({
                    where: {subscriberId: parent.id},
                    include: {author: true, subscriber: true}
                })


                if (null === subscribedOn) {
                    return [];
                }

                return subscribedOn.map(subscribedItem => subscribedItem.author);
            }
        },
        subscribedToUser: {
            type: new GraphQLList(userType),
            resolve: async (parent: User) => {
                const subscribedOn =  await prisma.subscribersOnAuthors.findMany({
                    where: {authorId: parent.id},
                    include: {author: true, subscriber: true}
                });

                if (null === subscribedOn) {
                    return [];
                }

                return subscribedOn.map(subscribedItem => subscribedItem.subscriber);
            }
        }
    }),
});

export const authorSubscriberType: GraphQLObjectType = new GraphQLObjectType({
    name: 'SubscribersOnAuthors',
    fields: () => ({
        subscriber: {type: userType},
        author: { type: userType },
        subscribedToUserId: { type: new GraphQLNonNull(UUIDType) },
        userSubscribedToId: { type: new GraphQLNonNull(UUIDType) }
    }),
});


export const postType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        author:  {type: new GraphQLNonNull(userType)},
        authorId: {type: new GraphQLNonNull(GraphQLString)},
    }),
});