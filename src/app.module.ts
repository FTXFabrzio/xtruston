import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './infrastructure/modules/whatsapp/whatsapp.module';
import { RepositoriesModule } from './infrastructure/repositories/repositories.module';
import { ApplicationModule } from './application/application.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    RepositoriesModule,
    ApplicationModule,
    WhatsappModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }