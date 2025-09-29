import { IsString, IsNotEmpty, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class ResignEmployeeDto {
  @IsString()
  @IsNotEmpty({ message: '離職原因不能為空' })
  @MaxLength(1000, { message: '離職原因不能超過1000個字符' })
  resignationReason: string;

  @IsOptional()
  @IsDateString({}, { message: '離職日期格式不正確' })
  resignationDate?: string;
}