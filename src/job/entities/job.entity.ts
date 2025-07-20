import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/entity/user.entity';
import { IsDate } from 'class-validator';

export enum JobCategory {
    TECH = 'tech',
    HEALTH = 'health',
    EDUCATION = 'education',
    SALES = 'sales',
    FINANCE = 'finance',
}

export enum JobType {
    FULL_TIME = 'full-time',
    PART_TIME = 'part-time',
    REMOTE = 'remote',
    INTERNSHIP = 'internship',
}

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    company: string;

    @Column('text')
    description: string;

    @Column()
    location: string;

    @Column()
    salary: number;

    @Column({
        type: 'enum',
        enum: JobType,
    })
    jobType: JobType;

    @Column({
        type: 'enum',
        enum: JobCategory,
    })
    category: JobCategory;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, (user) => user.email)
    employer: User;

    @Column({ default: 0 })
    applicationsCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @IsDate()
    deadline: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}


/*
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entity/user.entity';
import { IsDate } from 'class-validator';

@Entity('jobs')
export class Job {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'Frontend Developer' })
    @Column()
    title: string;

    @ApiProperty({example: 'we-are-looking-for-a-skilled-frontend-developer-with-react-experience'})
    @Column({ unique: true })
    slug: string;

    @ApiProperty({example: "Google"})
    @Column()
    company: string;

    @ApiProperty({ example: 'We are looking for a skilled frontend developer with React experience.' })
    @Column('text')
    description: string;

    @ApiProperty({ example: 'Pokhara, Nepal' })
    @Column()
    location: string;

    @ApiProperty({ example: 50000  })
    @Column()
    salary: number;

    @ApiProperty({ example: 'Full-time' })
    @Column()
    jobType: string;

    @ApiProperty({example: 'tech'})
    @Column()
    category: string;

    @ApiProperty({ example: true })
    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, (user) => user.email)
    employer: User;

    @Column({ default: 0 })
    applicationsCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @IsDate()
    deadline: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

*/