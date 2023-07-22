import {InvalidArgumentException} from "./Exception/invalid_argument.js";
import {CreatePostInput, CreateProfileInput, CreateUserInput} from "./dto-types.js";

const START_VALIDATION_YEAR = 1950;
export const createUserValidator = (name: string, balance: number) => {
    if (name.trim().length <= 0) {
        throw new InvalidArgumentException('name should not be empty');
    }

    if (balance <= 0) {
        throw new InvalidArgumentException('balance should be positive');
    }
}

export const profileInputValidator = (profileInput: CreateProfileInput) => {
    if (!Number.isInteger(profileInput.yearOfBirth) || profileInput.yearOfBirth < START_VALIDATION_YEAR) {
        throw new InvalidArgumentException(`Year of birth can't be < ${START_VALIDATION_YEAR}`);
    }
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

};