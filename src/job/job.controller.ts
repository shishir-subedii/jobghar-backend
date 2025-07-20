import { Controller, Post, Body, UseGuards, Req, Get, Param, ParseIntPipe, Query, Patch, Delete } from '@nestjs/common';
import { JobService } from './job.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiBadRequestResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from 'src/common/auth/AuthGuard';
import { Roles } from 'src/common/auth/AuthRoles';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) { }

  /*
  Get all active jobs --> this one is for all users
  */
  @ApiOperation({ summary: 'Get all active jobs' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users per page',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    type: Number,
  })
  @ApiResponse({ status: 200, description: 'List of active jobs' })
  @Get()
  async getAllJobs(@Query() query: { page?: string; limit?: string }) {
    const page = query.page && parseInt(query.page) > 0 ? parseInt(query.page) : 1;
    const limit = query.limit && parseInt(query.limit) > 0 ? parseInt(query.limit) : 10;
    const jobs = await this.jobService.getAllJobs(page, limit);
    return {
      success: true,
      message: 'Jobs fetched successfully',
      data: jobs,
    };
  }


  /*
  Get a job by slug?
  */
  @ApiOperation({ summary: 'Get a job by slug' })
  @ApiParam({ name: 'slug', type: String, description: 'Unique slug of the job' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiBadRequestResponse({ description: 'Job not found' })
  @Get(':slug')
  async getJobBySlug(@Param('slug') slug: string) {
    const job = await this.jobService.getJobBySlug(slug);
    return {
      success: true,
      message: 'Job fetched successfully',
      data: job,
    };
  }

  /*
  Create a new job
  This endpoint allows employers to create a new job listing.
  */
  @ApiOperation({ summary: 'Create a new job (Employer Only)' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiBadRequestResponse({ description: 'Only employers can create jobs' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('employer')
  async createJob(@Body() createJobDto: CreateJobDto, @Req() req: Request) {
    const user = req['user'] as { id: string; email: string; role: string };
    const data = await this.jobService.createJob(createJobDto, user as any);
    return {
      success: true,
      message: 'Job created successfully',
      data: data,
    }
  }

  /*
  update a job by slug
  */
  @ApiOperation({ summary: 'Update a job by slug' })
  @ApiParam({ name: 'slug', type: String, description: 'Unique slug of the job' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiBadRequestResponse({ description: 'Job not found' })
  @ApiBody({ type: UpdateJobDto })
  @ApiBearerAuth()
  @Patch(':slug')
  @Roles('employer')
  @UseGuards(JwtAuthGuard)
  async updateJob(@Param('slug') slug: string, @Body() updateJobDto: UpdateJobDto, @Req() req: Request) {
    const user = req['user'] as { id: string; email: string; role: string };
    const job = await this.jobService.updateJob(slug, updateJobDto, user as any);
    return {
      success: true,
      message: 'Job updated successfully',
      data: job,
    };
  }

  /*
  delete a job by slug
  */
  @ApiOperation({ summary: 'Delete a job by slug' })
  @ApiParam({ name: 'slug', type: String, description: 'Unique slug of the job' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiBadRequestResponse({ description: 'Job not found' })
  @ApiBearerAuth()
  @Delete(':slug/delete')
  @Roles('employer')
  @UseGuards(JwtAuthGuard)
  async deleteJob(@Param('slug') slug: string, @Req() req: Request) {
    const user = req['user'] as { id: string; email: string; role: string };
    await this.jobService.deleteJob(slug, user as any);
    return {
      success: true,
      message: 'Job deleted successfully',
    };
  }

  /*
  Find job by employer email
  */
  @ApiOperation({ summary: 'Find job by employer email (email extracted from token)' })
  @ApiResponse({ status: 200, description: 'Job found' })
  @ApiBadRequestResponse({ description: 'Job not found' })
  @ApiBearerAuth()
  @Get('employer/find')
  @Roles('employer')
  @UseGuards(JwtAuthGuard)
  async findJobByEmployerEmail(@Req() req: Request) {
    const user = req['user'] as { email: string };
    const email = user.email;
    const job = await this.jobService.getJobsByEmployer(email);
    console.log('Jobs found for employer:', job);
    return {
      success: true,
      message: 'Job found successfully',
      data: job,
    };
  }
}
