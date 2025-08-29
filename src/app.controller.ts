import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ResponseUtil } from './common/utils/response.util';
import { ApiSuccessResponse } from './common/interfaces/api-response.interface';
import { SuccessResponseDto } from './common/dto/success-response.dto';
import { ErrorResponseDto } from './common/dto/error-response.dto';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({
    status: 200,
    description: 'Returns hello message successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  getHello(): ApiSuccessResponse<string> {
    const message = this.appService.getHello();
    return ResponseUtil.success(message);
  }
}
