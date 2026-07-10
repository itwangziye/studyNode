import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata} from '@nestjs/common';


@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const val = Number(value);              // 哪个函数把字符串转数字?
    if (Number.isNaN(val)) {                           // 怎么判断转出来不合法?
      throw new BadRequestException(`${value} 不是合法数字`);  // 报错带上原值
    }
    return val;                          // 返回什么(注意类型)?
  }
}