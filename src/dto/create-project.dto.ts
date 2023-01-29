import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  domainName: string;

  @IsOptional()
  @IsBoolean()
  isConstructor: boolean;
}
