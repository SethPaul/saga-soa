import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { User } from './users.repository';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: User;
  }> {
    // Simple validation - in a real app you'd use class-validator or Zod pipes
    if (!createUserDto.name || !createUserDto.email) {
      throw new BadRequestException('Name and email are required');
    }

    const user = await this.usersService.createUser(createUserDto);
    return {
      message: 'User created successfully',
      user,
    };
  }

  @Get()
  async findAllUsers(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ): Promise<{
    message: string;
    data: {
      users: User[];
      total: number;
      limit: number;
      skip: number;
    };
  }> {
    const result = await this.usersService.findAllUsers(
      limit || 50,
      skip || 0,
    );
    
    return {
      message: 'Users retrieved successfully',
      data: result,
    };
  }

  @Get('stats')
  async getUserStats(): Promise<{
    message: string;
    stats: {
      totalUsers: number;
      usersByRole: Record<string, number>;
    };
  }> {
    const stats = await this.usersService.getUserStats();
    return {
      message: 'User statistics retrieved successfully',
      stats,
    };
  }

  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<{
    message: string;
    user: User;
  }> {
    if (!id || id.length !== 24) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.usersService.findUserById(id);
    return {
      message: 'User retrieved successfully',
      user,
    };
  }

  @Get('email/:email')
  async findUserByEmail(@Param('email') email: string): Promise<{
    message: string;
    user: User | null;
  }> {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email format');
    }

    const user = await this.usersService.findUserByEmail(email);
    return {
      message: user ? 'User found' : 'User not found',
      user,
    };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    user: User;
  }> {
    if (!id || id.length !== 24) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.usersService.updateUser(id, updateUserDto);
    return {
      message: 'User updated successfully',
      user,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    if (!id || id.length !== 24) {
      throw new BadRequestException('Invalid user ID format');
    }

    await this.usersService.deleteUser(id);
  }

  @Get(':id/profile')
  async getUserProfile(@Param('id') id: string): Promise<{
    message: string;
    profile: Omit<User, 'createdAt' | 'updatedAt'>;
  }> {
    if (!id || id.length !== 24) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.usersService.findUserById(id);
    const { createdAt, updatedAt, ...profile } = user;
    
    return {
      message: 'User profile retrieved successfully',
      profile,
    };
  }
}