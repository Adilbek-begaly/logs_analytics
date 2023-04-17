import {Session} from "@yandex-cloud/nodejs-sdk";
import {
    LogIngestionServiceClient, WriteRequest
} from "@yandex-cloud/nodejs-sdk/dist/generated/yandex/cloud/logging/v1/log_ingestion_service";

const token = "t1.9euelZqQkYvPzsqJjIuSiovJjszNze3rnpWanpadj8fJzI3Jk52TyJCUmonl8_djRi1k-e8IdBU4_d3z9yN1KmT57wh0FTj9.CTAZavN2xbGmpKq5pL_p8wnwSrde9_LfnqqFv7Udc1libtDSjjHsLcXHanIE_BDBCum810LxbXBhd4NPsa-TBg"

export async function consoleLogging (jsonPayload: object) {
    const session = new Session({iamToken: token})
    const client = session.client(LogIngestionServiceClient)
    const res = await client.write(WriteRequest.fromPartial({
        destination: {
            logGroupId: "e23lvo9k4fdtg7pi62mn"
        },
        entries: [
            {
                message: 'analytics',
                jsonPayload,
                level: 5,
                timestamp: new Date(Date.now()),
            }
        ]
    }))
    console.log(res)
}