import { IsOptional, IsString } from 'class-validator';

export class QueryMemberDto {
  @IsOptional()
  @IsString()
  search?: string; // 搜尋姓名、電話、email

  @IsOptional()
  @IsString()
  branchId?: string; // 篩選分店

  @IsOptional()
  page?: string | number; // 由 service 層處理轉換

  @IsOptional()
  limit?: string | number; // 由 service 層處理轉換
}
