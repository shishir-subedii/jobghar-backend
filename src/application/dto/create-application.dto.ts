import { IsString } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    jobSlug: string;

    @IsString()
    coverLetter: string;
}
