import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  domainName: string;

  @IsString()
  @IsNotEmpty()
  hostedZoneId: string;

  @IsOptional()
  @IsBoolean()
  isConstructor: boolean;
}
