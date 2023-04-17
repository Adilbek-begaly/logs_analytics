import {ConfigService} from "@nestjs/config";
import {Transport} from "@nestjs/microservices";

const configService = new ConfigService()
export const redisConfig = {
      transport: Transport.REDIS,
      options: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
      },
  };