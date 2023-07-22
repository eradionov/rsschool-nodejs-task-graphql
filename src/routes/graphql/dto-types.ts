import {UUID} from "crypto";
import {MemberTypeId} from "../member-types/schemas.js";

export interface CreateProfileInput {
    userId: UUID,
    isMale: boolean,
    yearOfBirth: number,
    memberTypeId: MemberTypeId
}

export interface CreateUserInput {
    id: UUID,
    name: string,
    balance: number,
}

export interface CreatePostInput {
    authorId: UUID,
    content: string,
    title: string,
}