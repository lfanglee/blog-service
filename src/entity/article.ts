/* eslint-disable camelcase */
import {
    Entity, ObjectID, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import {
    IsNotEmpty, IsDate, IsUrl, IsEnum, IsArray
} from 'class-validator';
import { IsArrayOfMongoId } from '../decorators/isArrayOfMongoId';

export interface Meta {
    views: number;
    likes: number;
    comments: number;
}

enum StateEnum {
    publish = 1,
    draft = 2
}

enum PublishEnum {
    public = 1,
    private = 2
}

enum TypeEnum {
    normal = 1,
    others = 2
}

@Entity()
export default class Article {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    @IsNotEmpty({ message: '文章标题不可为空' })
    title: string

    @Column()
    @IsNotEmpty({ message: '关键词不可为空' })
    keyword: string

    @Column()
    descript: string

    @Column()
    @IsNotEmpty({ message: '文章内容不可为空' })
    content: string

    @Column({ type: 'integer', default: 1 })
    @IsEnum(StateEnum, { message: '该文章state不存在' })
    state: number // 1 发布  2 草稿

    @Column({ type: 'integer', default: 1 })
    @IsEnum(PublishEnum, { message: '该文章发布权限不存在' })
    publish: number // 1 公开 2 私有

    @Column()
    @IsUrl({}, { message: '缩略图链接不合法' })
    thumb: string

    @Column({ type: 'integer', default: 1 })
    @IsEnum(TypeEnum, { message: '该文章类型不存在' })
    type: number // 1 code

    @Column()
    @IsArrayOfMongoId({
        message: '标签ID不合法'
    })
    @IsArray()
    tags: string[]

    @CreateDateColumn()
    @IsDate()
    create_at: Date

    @UpdateDateColumn()
    @IsDate()
    update_at: Date

    @Column()
    meta: Meta
}
