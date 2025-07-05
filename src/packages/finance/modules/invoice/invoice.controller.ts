import {
    Body,
    Controller,
    Post,
    Put,
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
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateMutipleInvoiceDto } from './dto/create-multiple-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { SearchInvoicesDto } from './dto/search-invoice.dto';

@ApiTags('Invoice')
@Controller('invoice')
@ApiExtraModels(
    CreateInvoiceDto,
    CreateMutipleInvoiceDto,
    UpdateInvoiceDto,
    SearchInvoicesDto
)
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create a new invoice' })
    @ApiBody({ type: CreateInvoiceDto })
    @ApiResponse({
        status: 201,
        description: 'Invoice created successfully',
        type: CreateInvoiceDto,
    })
    async createInvoice(
        @Req() req: AuthenticatedRequest,
        @Body() createInvoiceDto: CreateInvoiceDto
    ) {
        return this.invoiceService.create(createInvoiceDto, req.user);
    }

    @Post('multiple')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiOperation({ summary: 'Create multiple invoices' })
    @ApiBody({ type: CreateMutipleInvoiceDto })
    @ApiResponse({
        status: 201,
        description: 'Multiple invoices created successfully',
        type: CreateMutipleInvoiceDto,
    })
    async createMultipleInvoices(
        @Req() req: AuthenticatedRequest,
        @Body() createMutipleInvoiceDto: CreateMutipleInvoiceDto
    ) {
        return this.invoiceService.createMultiple(
            createMutipleInvoiceDto,
            req.user
        );
    }

    @Get('get-by-student/:studentId')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'studentId', required: true, description: 'Student ID' })
    @ApiOperation({ summary: 'Get all invoices for a student' })
    @ApiResponse({
        status: 200,
        description: 'Invoices retrieved successfully',
        type: [CreateInvoiceDto],
    })
    async getAllInvoices(
        @Req() req: AuthenticatedRequest,
        @Param('studentId') studentId: string,
        @Body() searchParams?: SearchInvoicesDto
    ) {
        return this.invoiceService.findAll(studentId, req.user, searchParams);
    }

     @Get('all')
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiParam({ name: 'studentId', required: true, description: 'Student ID' })
    @ApiOperation({ summary: 'Get all invoices for a student' })
    @ApiResponse({
        status: 200,
        description: 'Invoices retrieved successfully',
        type: [CreateInvoiceDto],
    })
    async getAllInvoices1(
        @Req() req: AuthenticatedRequest,
        @Param('studentId') studentId: string,
        @Body() searchParams?: SearchInvoicesDto
    ) {
        return this.invoiceService.findAll(studentId, req.user, searchParams);
    }

    @Put(':id')
    @ApiParam({ name: 'id', required: true, description: 'Invoice ID' })
    @ApiOperation({ summary: 'Update an existing invoice' })
    @ApiBody({ type: UpdateInvoiceDto })
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiResponse({
        status: 200,
        description: 'Invoice updated successfully',
        type: UpdateInvoiceDto,
    })
    async updateInvoice(
        @Param('id') id: string,
        @Body() updateInvoiceDto: UpdateInvoiceDto
    ) {
        return this.invoiceService.update(id, updateInvoiceDto);
    }

    @Get('get-by-id/:id/:student_id')
    @ApiParam({ name: 'id', required: true, description: 'Invoice ID' })
    @ApiParam({ name: 'student_id', required: true, description: 'Student ID' })
    @ApiOperation({ summary: 'Get invoice by ID' })
    @UseGuards(AuthGuard)
    @ApiBearerAuth('JWT')
    @ApiResponse({
        status: 200,
        description: 'Invoice retrieved successfully',
        type: CreateInvoiceDto,
    })
    async getInvoiceById(
        @Param('id') id: string,
        @Param('student_id') student_id: string,
        @Req() req: AuthenticatedRequest
    ) {
        return this.invoiceService.findOne(id, req.user, student_id);
    }
}

export default InvoiceController;
