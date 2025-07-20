// users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({select: false})
    password: string;

    @Column({ nullable: true, default: null, type: 'text', select: false })
    accessToken: string | null;

    @Column({
        type: 'enum',
        enum: ['seeker', 'employer'],
        default: 'seeker',
    })
    role: 'seeker' | 'employer';

    @Column({ nullable: true })
    age: number;

    @Column({ default: true })
    isProfileComplete: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
