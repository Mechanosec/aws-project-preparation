import { ACMClient, RequestCertificateCommand } from '@aws-sdk/client-acm';
import { awsConfig } from '../config';

const client = new ACMClient(awsConfig);

const acmHandler = async (domainName: string) => {
  const certificate = new RequestCertificateCommand({
    DomainName: domainName,
    SubjectAlternativeNames: [`*.${domainName}`],
  });

  try {
    await client.send(certificate);

    console.log('_____CERTIFICATE CREATED_____');
  } catch (error) {
    console.log(error);
  }
};

export { acmHandler };
