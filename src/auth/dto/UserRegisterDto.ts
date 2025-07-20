import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

export class UserRegisterDto {

    @ApiProperty({example: 'Bob'})
    @IsString()
    name: string;

    @ApiProperty({example: 'seeker'})
    @IsString()
    role: 'seeker' | 'employer' = 'seeker';

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 30 })
    @IsNumber()
    age: number;

    @ApiProperty({ example: 'securePassword123' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'securePassword123' })
    @IsString()
    confirmPassword: string;
}

//Remaining data we will update later