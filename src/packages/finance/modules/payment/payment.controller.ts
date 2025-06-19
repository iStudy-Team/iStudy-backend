import {
    Body,
    Controller,
    Post,
    Param,
    Get,
    UseGuards,
    Req,
} from '@nestjs/common';
import {
    ApiResponse,
    ApiExtraModels,
    ApiOperation,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { AuthenticatedRequest } from 'src/packages/auth/dto/request-width-auth.dto';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { SearchPaymentsDto } from './dto/search-payment.dto';

@ApiTags('Payment')
@Controller('payment')
@ApiExtraModels(CreatePaymentDto, SearchPaymentsDto)
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new payment' })
    @ApiBody({ type: CreatePaymentDto })
    @ApiResponse({
        status: 201,
        description: 'Payment created successfully',
        type: CreatePaymentDto,
    })
    async createPayment(
        @Req() req: AuthenticatedRequest,
        @Body() createPaymentDto: CreatePaymentDto
    ) {
        return this.paymentService.create(createPaymentDto, req.user);
    }

    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Get all payments' })
    @ApiResponse({
        status: 200,
        description: 'List of payments',
        type: [CreatePaymentDto],
    })
    async getAllPayments(
        @Req() req: AuthenticatedRequest,
        @Body() searchParams?: SearchPaymentsDto
    ) {
        return this.paymentService.findAll(req.user, searchParams);
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Get a payment by ID' })
    @ApiParam({ name: 'id', type: String, description: 'Payment ID' })
    @ApiResponse({
        status: 200,
        description: 'Payment details',
        type: CreatePaymentDto,
    })
    async getPaymentById(
        @Req() req: AuthenticatedRequest,
        @Param('id') id: string
    ) {
        return this.paymentService.findOne(id, req.user);
    }
}
