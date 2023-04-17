import {Injectable} from "@nestjs/common";
import {Session} from "@yandex-cloud/nodejs-sdk";
import {
    LogIngestionServiceClient, WriteRequest
} from "@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/logging/v1/log_ingestion_service";

@Injectable()
export class YcLoggingService {

    public async error(jsonPayload: object) {
        const token =  "t1.9euelZqQkYvPzsqJjIuSiovJjszNze3rnpWanpadj8fJzI3Jk52TyJCUmonl8_djRi1k-e8IdBU4_d3z9yN1KmT57wh0FTj9.CTAZavN2xbGmpKq5pL_p8wnwSrde9_LfnqqFv7Udc1libtDSjjHsLcXHanIE_BDBCum810LxbXBhd4NPsa-TBg"
        const session = new Session({iamToken: token})
        const client = await session.client(LogIngestionServiceClient)
        const response = await client.write(WriteRequest.fromPartial({
            destination: {
                logGroupId: 'e23lvo9k4fdtg7pi62mn'
            },
            entries: [
                {
                    message: 'analytics',
                    jsonPayload,
                    level: 3,
                    timestamp: new Date(Date.now())
                }
            ]
        }))
        console.log(response)
    }
}