import {
  ACMClient,
  CertificateDetail,
  DescribeCertificateCommand,
  DescribeCertificateCommandOutput,
  RequestCertificateCommand,
  RequestCertificateCommandOutput,
  ValidationMethod,
} from '@aws-sdk/client-acm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { awsConfig } from '../../utils/awsConfig';

@Injectable()
export class AcmService {
  private readonly client: ACMClient;

  constructor() {
    this.client = new ACMClient(awsConfig);
  }

  async create(domainName: string) {
    const newCertificate = new RequestCertificateCommand({
      DomainName: domainName,
      SubjectAlternativeNames: [`*.${domainName}`],
      ValidationMethod: ValidationMethod.DNS,
    });

    try {
      const response: RequestCertificateCommandOutput = await this.client.send(
        newCertificate,
      );

      console.log('_____CERTIFICATE CREATED_____');
      return response.CertificateArn;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async get(certificateArn: string): Promise<CertificateDetail> {
    try {
      const certificate = new DescribeCertificateCommand({
        CertificateArn: certificateArn,
      });

      const response: DescribeCertificateCommandOutput = await this.client.send(
        certificate,
      );

      return response.Certificate;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
