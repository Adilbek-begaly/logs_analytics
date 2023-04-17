import {NestFactory} from "@nestjs/core";
import {ConfigService} from "@nestjs/config";
import {MicroserviceOptions} from "@nestjs/microservices";
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {AppModule} from "./app.module";
import {rabbitConfig} from "./providers/rabbit/config";


async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  app.useGlobalPipes(new ValidationPipe({transform: true}))

  const config = new DocumentBuilder()
      .setTitle('Analytics')
      .setDescription('The microservice analytics API')
      .setVersion('1.0')
      .build();

  const document = SwaggerModule.createDocument(app, config, {extraModels: []})
  SwaggerModule.setup('api', app, document)

  app.connectMicroservice<MicroserviceOptions>(rabbitConfig as MicroserviceOptions,{inheritAppConfig:true})
  app.startAllMicroservices()
  await app.listen(3333)
}
bootstrap()