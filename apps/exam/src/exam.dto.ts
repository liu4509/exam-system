import { IsNotEmpty, IsString } from 'class-validator';

export class ExamAddDto {
  @IsNotEmpty({ message: '考试名不能为空' })
  name: string;

  content: string;
}

export class ExamSaveDto {
  @IsNotEmpty({ message: '考试id不能为空' })
  id: number;

  @IsString()
  content: string;
}
