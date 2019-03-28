import {
    registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface,
    ValidationArguments, Validator
} from 'class-validator';

const validator = new Validator();

@ValidatorConstraint({ async: false })
export class IsArrayOfMongoIdConstraint implements ValidatorConstraintInterface {
    validate(arr: Array<string>, args: ValidationArguments) {
        return !arr.filter((id: string) => !validator.isMongoId(id)).length;
    }

    defaultMessage(args: ValidationArguments) {
        return 'ID不是合法的mongoID';
    }
}

export function IsArrayOfMongoId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsArrayOfMongoIdConstraint
        });
    };
}
