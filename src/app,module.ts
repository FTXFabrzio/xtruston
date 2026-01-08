import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappModule } from './infrastructure/modules/whatsapp/whatsapp.module';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),WhatsappModule],
  controllers: [],
  providers: [],
})
export class AppModule {}