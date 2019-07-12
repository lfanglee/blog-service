/* eslint-disable camelcase */
import {
    Entity, ObjectID, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import {
    IsDate, IsNotEmpty
} from 'class-validator';

@Entity()
export default class Tag {
    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    @IsNotEmpty({ message: '原文件名不可为空' })
    originName: string;

    @Column()
    @IsNotEmpty({ message: '存储文件名不可为空' })
    savedName: string;

    @Column()
    @IsNotEmpty({ message: '文件路径不可为空' })
    path: string;

    @Column()
    size: number;

    @CreateDateColumn()
    @IsDate()
    create_at: Date;
}
