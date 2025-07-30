import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { CreateApplicationDto } from './dto/create-application.dto';
import { User } from 'src/user/entity/user.entity';
import { JobService } from 'src/job/job.service';
import { jwtPayloadType } from 'src/common/types/auth.types';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepo: Repository<Application>,
    private readonly jobService : JobService,
    private readonly userService: UserService
  ) { }

  async apply(dto: CreateApplicationDto, user: jwtPayloadType, cvFilePath: string) {
    try {
      if (!cvFilePath) {
        throw new BadRequestException('CV file is required');
      }
      const applicant = await this.userService.findOneById(user.id);
      if (!applicant) {
        throw new BadRequestException('Applicant not found');
      }

      //Check previous application
      const existingApplication = await this.applicationRepo.findOne({
        where: { applicantId: applicant.id, jobSlug: dto.jobSlug },
      });
      if (existingApplication) {
        throw new BadRequestException('You have already applied for this job');
      }
      
      const findJob = await this.jobService.getJobBySlug(dto.jobSlug);
      if (!findJob) {
        throw new BadRequestException('Job not found');
      }

      if(findJob.deadline < new Date()) {
        throw new BadRequestException('Job application deadline has passed');
      }

      const application = this.applicationRepo.create({
        applicantId: applicant.id,
        applicantName: applicant.name,
        applicantEmail: applicant.email,
        jobSlug: dto.jobSlug,
        coverLetter: dto.coverLetter,
        jobTitle: findJob.title,
        cv: cvFilePath,
      });

      //change the job application counter to +1
      await this.jobService.increaseJobApplicationsCount(dto.jobSlug);

      return await this.applicationRepo.save(application);
    } catch (err) {
      throw new InternalServerErrorException('Failed to submit application');
    }
  }

  async getMyApplications(userId: number) {
    return this.applicationRepo.find({ where: { applicantId: userId }, order: { appliedAt: 'DESC' } });
  }

  async findOneApplication(applicationId: number, userEmail: string) {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId, applicantEmail: userEmail },
    });
    if (!application) {
      throw new BadRequestException('Application not found');
    }
    return application;
  }

  async findOneApplicationForEmployer(applicationId: number){
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
    });
    if (!application) {
      throw new BadRequestException('Application not found');
    }
    return application;
  }

  async getJobApplications(jobSlug: string, status: 'submitted' | 'reviewed' = 'submitted') {
    return this.applicationRepo.find({
      where: { jobSlug, status: status},
      order: { appliedAt: 'DESC' },
    });
  }

  async markAsReviewed(applicationId: number) {
    const application = await this.applicationRepo.findOne({ where: { id: applicationId } });
    if (!application) {
      throw new BadRequestException('Application not found');
    }
    application.status = 'reviewed';
    return this.applicationRepo.save(application);
  }
}
