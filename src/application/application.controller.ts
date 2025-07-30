import { Controller, Post, UseGuards, Body, Req, UploadedFile, UseInterceptors, BadRequestException, Get, Delete, Param, Patch } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from 'src/common/auth/AuthGuard';
import { Roles } from 'src/common/auth/AuthRoles';
import { Request } from 'express';
import { CreateApplicationDto } from './dto/create-application.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { jwtPayloadType } from 'src/common/types/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private applicationService: ApplicationService) { }

  //For seekers
  /*
  Create a new application for a job
  */

  @ApiOperation({ summary: 'Apply for a job (Seeker only)' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        jobSlug: { type: 'string', example: 'frontend-developer-google' },
        coverLetter: { type: 'string', example: 'I am very interested in this job...' },
        cv: { type: 'string', format: 'binary', description: 'PDF file should be under 2mb' },  //  Important for file upload
      },
      required: ['jobSlug', 'coverLetter', 'cv'],
    },
  })
  @Post()
  @Roles('seeker')
  @UseInterceptors(FileInterceptor('cv', {
    storage: diskStorage({
      destination: './uploads/cvs',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf)$/)) {
        return cb(new BadRequestException('Only PDF files are allowed under 2mb'), false);
      }
      cb(null, true);
    },
  }))
  async apply(
    @Body() dto: CreateApplicationDto,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File
  ) {
    const user = req['user'] as jwtPayloadType;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    const application = await this.applicationService.apply(dto, user as jwtPayloadType, imageUrl);

    return {
      success: true,
      message: 'Application submitted successfully',
      data: application,
    };
  }

  /*
  View job applications you've submitted --> seeker
  */
  @ApiOperation({ summary: 'View your job applications (Seeker only)' })
  @ApiBearerAuth()
  @Get('my-applications')
  @Roles('seeker')
  async myApplications(@Req() req: Request) {
    const user = req['user'] as jwtPayloadType;
    const applications = await this.applicationService.getMyApplications(user.id);

    return {
      success: true,
      message: 'Your job applications retrieved successfully',
      data: applications,
    };
  }

  /*
  view a specific application by ID --> seeker
  */
  @ApiOperation({ summary: 'View a specific application (Seeker only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Application ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @Get(':id')
  @Roles('seeker')
  async findOneApplication(@Param('id') id: number, @Req() req: Request) {
    const user = req['user'] as jwtPayloadType;
    const application = await this.applicationService.findOneApplication(id, user.email);

    return {
      success: true,
      message: 'Application retrieved successfully',
      data: application,
    };
  }

  // For employers
  /*
  View all applications for a job --> employer
  */
  @ApiOperation({ summary: 'View all submitted applications for a job (Employer only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'jobSlug', type: String, description: 'Job slug' })
  @Get('job/:jobSlug')
  
  @Roles('employer')
  async getJobApplications(@Param('jobSlug') jobSlug: string, @Req() req: Request) {
    const user = req['user'] as jwtPayloadType;
    if (!jobSlug) {
      throw new BadRequestException('Job slug is required');
    }
    if (user.role !== 'employer') {
      throw new BadRequestException('You are not authorized to view job applications');
    }
    const applications = await this.applicationService.getJobApplications(jobSlug, 'submitted');

    return {
      success: true,
      message: 'Job applications retrieved successfully',
      data: applications,
    };
  }

  /*
  View all reviewed applications for a job --> employer
  */
  @ApiOperation({ summary: 'View all reviewed applications for a job (Employer only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'jobSlug', type: String, description: 'Job slug' })
  @Get('job/:jobSlug/reviewed')
  @Roles('employer')
  async getReviewedJobApplications(@Param('jobSlug') jobSlug: string, @Req() req: Request) {
    const user = req['user'] as jwtPayloadType;
    if (!jobSlug) {
      throw new BadRequestException('Job slug is required');
    }
    if (user.role !== 'employer') {
      throw new BadRequestException('You are not authorized to view job applications');
    }
    const applications = await this.applicationService.getJobApplications(jobSlug, 'reviewed');

    return {
      success: true,
      message: 'Reviewed job applications retrieved successfully',
      data: applications,
    };
  }

  /*
  View a specific application by ID for an employer
  */
  @ApiOperation({ summary: 'View a specific application (Employer only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Application ID' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Application retrieved successfully' })
  @Get('application/:id')
  @Roles('employer')
  async findOneApplicationForEmployer(@Param('id') id: number, @Req() req: Request) {
    const user = req['user'] as jwtPayloadType;
    if (user.role !== 'employer') {
      throw new BadRequestException('You are not authorized to view this application');
    }
    const application = await this.applicationService.findOneApplicationForEmployer(id);

    return {
      success: true,
      message: 'Application retrieved successfully',
      data: application,
    };
  }

  /*
  Mark an application as reviewed by an employer
  */
  @ApiOperation({ summary: 'Mark an application as reviewed (Employer only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number, description: 'Application ID' })
  @Patch(':id/review')
  @Roles('employer')
  async markAsReviewed(@Param('id') id: number, @Req() req: Request) {
    const user = req['user'] as jwtPayloadType;
    if (user.role !== 'employer') {
      throw new BadRequestException('You are not authorized to mark applications as reviewed');
    }
    const application = await this.applicationService.markAsReviewed(id);

    return {
      success: true,
      message: 'Application marked as reviewed successfully',
      data: application,
    };
  }

}
