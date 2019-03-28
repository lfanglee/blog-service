import {
    Entity, ObjectID, ObjectIdColumn, Column
} from 'typeorm';

@Entity()
export default class Auth {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    name: string;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column()
    gravatar: string

    @Column()
    slogan: string
}
