import {
  ACMClient,
  GetCertificateCommand,
  GetCertificateCommandOutput,
  RequestCertificateCommand,
  RequestCertificateCommandOutput,
  ValidationMethod,
} from '@aws-sdk/client-acm';
import { awsConfig } from '../config';

const client = new ACMClient(awsConfig);

const acmCreator = async (domainName: string): Promise<string> => {
  const newCertificate = new RequestCertificateCommand({
    DomainName: domainName,
    SubjectAlternativeNames: [`*.${domainName}`],
    ValidationMethod: ValidationMethod.DNS,
  });

  try {
    const response: RequestCertificateCommandOutput = await client.send(
      newCertificate
    );

    console.log('_____CERTIFICATE CREATED_____');
    return response.CertificateArn;
  } catch (error) {
    console.log(error);
  }
};

const acmGet = async (
  certificateArn: string
): Promise<GetCertificateCommandOutput> => {
  const certificate = new GetCertificateCommand({
    CertificateArn: certificateArn,
  });
  try {
    return await client.send(certificate);
  } catch (error) {
    console.log(error);
  }
};

export { acmCreator, acmGet };
