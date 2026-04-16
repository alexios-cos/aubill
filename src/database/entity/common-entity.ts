import { BeforeInsert, BeforeUpdate, Column, PrimaryGeneratedColumn } from "typeorm";

export class IdAwareEntity {

    @PrimaryGeneratedColumn()
    id!: number;

}

export class CreatedAtAwareEntity extends IdAwareEntity {

    @Column({
        name: 'created_at',
        type: 'timestamp',
        nullable: true,
    })
    createdAt?: Date;

    @BeforeInsert()
    public async setCreatedAt(): Promise<void> {
        this.createdAt = new Date();
    }

}

export class TimestampAwareEntity extends CreatedAtAwareEntity {

    @Column({
        name: 'updated_at',
        type: 'timestamp',
        nullable: true,
    })
    updatedAt?: Date;

    @BeforeInsert()
    public async setCreatedAt(): Promise<void> {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    @BeforeUpdate()
    public async setUpdatedAt(): Promise<void> {
        this.updatedAt = new Date();
    }

}