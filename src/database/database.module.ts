// import { Module } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';

// @Module({
//     imports: [
//         TypeOrmModule.forRootAsync({
//             useFactory: async (configService: ConfigService) => ({
//                 type: 'postgres',
//                 host: configService.get<string>('DB_HOST'),
//                 port: configService.get<number>('DB_PORT'),
//                 username: configService.get<string>('DB_USERNAME'),
//                 password: configService.get<string>('DB_PASSWORD'),
//                 database: configService.get<string>('DB_NAME'),
//                 autoLoadEntities: true,
//                 synchronize: true, // ❗Set to false in production and use migrations instead
//             }),
//             inject: [ConfigService],
//         }),
//     ],
// })
// export class DatabaseModule { }


import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                autoLoadEntities: true,
                synchronize: true, // ❗Disable this in production and use migrations
                ssl: {
                    rejectUnauthorized: false, // Required by Neon
                },
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule { }
