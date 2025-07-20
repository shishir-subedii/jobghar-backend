import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './entities/job.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/user/user.module';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Job]), JwtModule.register({})],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService], // Exporting JobService to be used in other modules
})
export class JobModule {}
