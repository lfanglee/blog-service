/* eslint-disable camelcase */
import {
    Entity, ObjectID, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';

@Entity()
export default class Tag {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    name: string

    @Column()
    descript: string

    @Column()
    sort: number

    @CreateDateColumn()
    create_at: Date

    @UpdateDateColumn()
    update_at: Date
}
