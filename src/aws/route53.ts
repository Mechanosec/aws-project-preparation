import {
  ChangeAction,
  ChangeResourceRecordSetsCommand,
  Route53Client,
  RRType,
} from '@aws-sdk/client-route-53';
import { awsConfig } from '../config';

const client = new Route53Client(awsConfig);

const route53Handler = async (
  hostedZoneId: string,
  distribution: { hostedZoneId: string; name: string },
  recordName: string
) => {
  const distributionRecord = new ChangeResourceRecordSetsCommand({
    HostedZoneId: hostedZoneId,
    ChangeBatch: {
      Changes: [
        {
          Action: ChangeAction.CREATE,
          ResourceRecordSet: {
            Name: recordName,
            Type: RRType.A,
            AliasTarget: {
              HostedZoneId: distribution.hostedZoneId,
              DNSName: distribution.name,
              EvaluateTargetHealth: false,
            },
          },
        },
      ],
    },
  });

  try {
    await client.send(distributionRecord);

    console.log('_____RECORD CREATED_____');
  } catch (error) {
    console.log(error);
  }
};

export { route53Handler };
