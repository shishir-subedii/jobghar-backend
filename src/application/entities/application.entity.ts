import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('applications')
export class Application {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    applicantId: number;

    @Column()
    applicantName: string;

    @Column()
    applicantEmail: string;

    @Column()
    jobSlug: string;

    @Column()
    jobTitle: string;

    @Column()
    cv: string;  // Store as filename or URL

    @Column('text')
    coverLetter: string;

    @Column({ default: 'submitted' })
    status: 'submitted' | 'reviewed' | 'accepted' | 'rejected';

    @CreateDateColumn()
    appliedAt: Date;
}
