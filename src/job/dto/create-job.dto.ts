// import { ApiProperty } from '@nestjs/swagger';
// import { IsString, IsNumber, IsOptional } from 'class-validator';

// export class CreateJobDto {
//     @ApiProperty({ example: 'Frontend Developer' })
//     @IsString()
//     title: string;

//     @ApiProperty({example: 'Google'})
//     @IsString()
//     company: string;

//     @ApiProperty({ example: 'We are looking for a skilled frontend developer.' })
//     @IsString()
//     description: string;

//     @ApiProperty({ example: 'Pokhara, Nepal' })
//     @IsString()
//     location: string;

//     @ApiProperty({ example: 50000 })
//     @IsNumber()
//     salary: number;

//     @ApiProperty({ example: '2025-12-31T23:59:59.999Z' })
//     @IsString()
//     deadline: string;

//     @ApiProperty({ example: 'Full-time' })
//     @IsString()
//     jobType: string;

//     @ApiProperty({ example: 'tech' })
//     @IsString()
//     category: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { JobType, JobCategory } from '../entities/job.entity';

export class CreateJobDto {
    @ApiProperty({ example: 'Frontend Developer' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Google' })
    @IsString()
    company: string;

    @ApiProperty({ example: 'We are looking for a skilled frontend developer.' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'Pokhara, Nepal' })
    @IsString()
    location: string;

    @ApiProperty({ example: 50000 })
    @IsNumber()
    salary: number;

    @ApiProperty({ example: '2025-12-31T23:59:59.999Z' })
    @IsDateString()
    deadline: string;

    @ApiProperty({ example: 'full-time', enum: JobType })
    @IsEnum(JobType)
    jobType: JobType;

    @ApiProperty({ example: 'tech', enum: JobCategory })
    @IsEnum(JobCategory)
    category: JobCategory;
}
