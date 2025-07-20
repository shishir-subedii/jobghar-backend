import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/user/user.module';
import { JobModule } from 'src/job/job.module';

@Module({
  imports: [UsersModule, JobModule, TypeOrmModule.forFeature([Application]), JwtModule.register({})],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
