import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export default class Test {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    name: string;
}
