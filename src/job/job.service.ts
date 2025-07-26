import { Injectable, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { User } from 'src/user/entity/user.entity';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) { }

  private generateSlug(title: string, company: string): string {
    const baseSlug = `${title}-${company}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumerics with "-"
      .replace(/^-+|-+$/g, '');    // trim - from start and end

    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    return `${baseSlug}-${uniqueSuffix}`;
  }

  async createJob(createJobDto: CreateJobDto, employer: User) {
    try {
      if (employer.role !== 'employer') {
        throw new BadRequestException('Only employers can create jobs.');
      }
      // Validate the deadline date
      if (new Date(createJobDto.deadline) <= new Date()) {
        throw new BadRequestException('Deadline must be a future date.');
      }

      // Generate a slug from the job title
      const slug = this.generateSlug(createJobDto.title, createJobDto.company);

      const job = this.jobRepository.create({
        ...createJobDto,
        employer: employer,
        slug
      });

      return await this.jobRepository.save(job);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to create job');
    }
  }

  async getAllJobs() {
    try {
      return await this.jobRepository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' }
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch jobs');
    }
  }


  async getJobBySlug(slug: string) {
    const job = await this.jobRepository.findOne({
      where: { slug },
      relations: ['employer'],
    });

    if (!job) throw new BadRequestException('Job not found');
    return job;
  }

  async updateJob(slug: string, updateJobDto: UpdateJobDto, employer: User) {
    try {
      const job = await this.jobRepository.findOne({
        where: { slug },
        relations: ['employer'],
      });

      if (!job) {
        throw new BadRequestException('Job not found');
      }

      if (job.employer.id !== employer.id) {
        throw new ForbiddenException('You are not allowed to update this job');
      }

      Object.assign(job, updateJobDto);

      return await this.jobRepository.save(job);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to update job');
    }
  }

  async deleteJob(slug: string, employer: User) {
    try {
      const job = await this.jobRepository.findOne({
        where: { slug },
        relations: ['employer'],
      });

      if (!job) {
        throw new BadRequestException('Job not found');
      }

      if (job.employer.id !== employer.id) {
        throw new ForbiddenException('You are not allowed to delete this job');
      }

      job.isActive = false; // Soft delete
      return await this.jobRepository.save(job);
    } catch (err) {
      if (err instanceof BadRequestException || err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Failed to delete job');
    }
  }

  async getJobsByEmployer(employerEmail: string) {
    console.log('Employer email:', employerEmail);
    try {
      if (!employerEmail) {
        throw new BadRequestException('Employer email is required');
      }
      return await this.jobRepository.find({
        where: { isActive: true, employer: { email: employerEmail } },
        order: { createdAt: 'DESC' },
        relations: ['employer']
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch jobs for employer');
    }
  }

  async increaseJobApplicationsCount(slug: string) {
    try {
      const job = await this.jobRepository.findOne({ where: { slug } });
      if (!job) {
        throw new BadRequestException('Job not found');
      }

      job.applicationsCount += 1;
      return await this.jobRepository.save(job);
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException('Failed to increase applications count');
    }
  }
}
