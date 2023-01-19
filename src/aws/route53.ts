import {
  ChangeAction,
  ChangeResourceRecordSetsCommand,
  Route53Client,
  RRType,
} from '@aws-sdk/client-route-53';
import { awsConfig } from '../config';

const client = new Route53Client(awsConfig);

const route53Handler = async (
  hostedZoneName: string,
  distribution: { id: string; name: string },
  recordName: string
) => {
  const distributionRecord = new ChangeResourceRecordSetsCommand({
    HostedZoneId: hostedZoneName,
    ChangeBatch: {
      Changes: [
        {
          Action: ChangeAction.CREATE,
          ResourceRecordSet: {
            Name: recordName,
            Type: RRType.A,
            AliasTarget: {
              HostedZoneId: distribution.id,
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
  } catch (error) {
    console.log(error);
  }
};

export { route53Handler };
