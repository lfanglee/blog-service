/* eslint-disable camelcase */
import {
    Entity, ObjectID, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import {
    IsDate, IsInt, IsNotEmpty, Min, Length
} from 'class-validator';

@Entity()
export default class Tag {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    @IsNotEmpty({ message: '原文件名不可为空' })
    originName: string

    @Column()
    @IsNotEmpty({ message: '存储文件名不可为空' })
    savedName: string

    @CreateDateColumn()
    @IsDate()
    create_at: Date
}
