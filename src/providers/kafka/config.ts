import {Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";

const configService = new ConfigService()
export const kafkaConfig = {
    transport: Transport.KAFKA,
    options: {
        client: {
            clientId: configService.get('KAFKA_GROUP_ID'),
            brokers: [configService.get('KAFKA_BROKER')],
        },
    },
}