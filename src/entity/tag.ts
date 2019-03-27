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
    @Length(0, 10, { message: '标签名长度不可超过十个字符' })
    @IsNotEmpty({ message: '标签名不可为空' })
    name: string

    @Column()
    @IsNotEmpty({ message: '标签描述不可为空' })
    descript: string

    @Column()
    @IsInt()
    @Min(0)
    sort: number

    @CreateDateColumn()
    @IsDate()
    create_at: Date

    @UpdateDateColumn()
    @IsDate()
    update_at: Date
}
