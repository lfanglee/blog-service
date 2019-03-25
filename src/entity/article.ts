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
    state: number

    @Column()
    publish: number

    @Column()
    thumb: string

    @Column()
    type: string

    @Column(type => Tag)
    tag: Tag[]

    @CreateDateColumn()
    create_at: Date

    @UpdateDateColumn()
    update_at: Date

    meta: Meta
}
