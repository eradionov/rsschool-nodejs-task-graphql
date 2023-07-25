import {InvalidArgumentException} from "./Exception/invalid_argument.js";
import {CreatePostInput, CreateProfileInput, CreateUserInput} from "./dto-types.js";

const MIN_YEAR_OF_BIRTH = 1950
const MAX_YEAR_OF_BIRTH = 2000;

export const createUserValidator = (name: string, balance: number) => {
    if (name.trim().length <= 0) {
        throw new InvalidArgumentException('name should not be empty');
    }

    if (balance <= 0) {
        throw new InvalidArgumentException('balance should be positive');
    }
}

export const profileInputValidator = (profileInput: CreateProfileInput) => {
    if (!Number.isInteger(profileInput.yearOfBirth)) {
        throw new InvalidArgumentException(`Int cannot represent non-integer value: ${profileInput.yearOfBirth}`);
    }
    //
    // if (profileInput.yearOfBirth < MIN_YEAR_OF_BIRTH || profileInput.yearOfBirth > MAX_YEAR_OF_BIRTH) {
    //     throw new InvalidArgumentException(`Year of birth should be between: ${MIN_YEAR_OF_BIRTH} and ${MAX_YEAR_OF_BIRTH}`);
    // }
}

export const userInputValidator = (userInput: CreateUserInput) => {
     if (userInput.name.trim().length === 0) {
         throw new InvalidArgumentException('User name should not be empty');
     }

    if (userInput.balance <= 0) {
        throw new InvalidArgumentException('User balance should be positive');
    }
}

export const postInputValidator = (postInput: CreatePostInput) => {
    if (postInput.title.trim().length === 0) {
        throw new InvalidArgumentException('Title should not be empty');
    }

    if (postInput.content.trim().length === 0) {
        throw new InvalidArgumentException('Content should be positive');
    }
};