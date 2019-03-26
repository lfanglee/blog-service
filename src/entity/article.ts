/* eslint-disable camelcase */
import {
    Entity, ObjectID, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import Tag from './tag';

export interface Meta {
    views: number,
    likes: number,
    comments: number
}

@Entity()
export default class Article {
    @ObjectIdColumn()
    id: ObjectID

    @Column()
    title: string

    @Column()
    keyword: string

    @Column()
    descript: string

    @Column()
    content: string

    @Column()
    state: number // 1 发布  2 草稿

    @Column()
    publish: number // 1 公开 2 私有

    @Column()
    thumb: string

    @Column()
    type: string // 1 code

    @Column(type => Tag)
    tag: Tag[]

    @CreateDateColumn()
    create_at: Date

    @UpdateDateColumn()
    update_at: Date

    @Column()
    meta: Meta
}
