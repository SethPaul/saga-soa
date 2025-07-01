import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { UsersRepository, User } from './users.repository';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    
    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const userData = {
      name: createUserDto.name,
      email: createUserDto.email,
      age: createUserDto.age,
      role: createUserDto.role,
    };

    const user = await this.usersRepository.create(userData);
    this.logger.log(`User created successfully with ID: ${user._id}`);
    return user;
  }

  async findUserById(id: string): Promise<User> {
    this.logger.log(`Finding user by ID: ${id}`);
    const user = await this.usersRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    return await this.usersRepository.findByEmail(email);
  }

  async findAllUsers(limit: number = 50, skip: number = 0): Promise<{
    users: User[];
    total: number;
    limit: number;
    skip: number;
  }> {
    this.logger.log(`Finding all users with limit: ${limit}, skip: ${skip}`);
    
    const [users, total] = await Promise.all([
      this.usersRepository.findAll(limit, skip),
      this.usersRepository.count(),
    ]);

    return {
      users,
      total,
      limit,
      skip,
    };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    this.logger.log(`Updating user with ID: ${id}`);
    
    // Check if user exists
    await this.findUserById(id);
    
    // Check if email is being updated and if it conflicts
    if (updateUserDto.email) {
      const existingUser = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser._id?.toString() !== id) {
        throw new ConflictException(`Email ${updateUserDto.email} is already in use`);
      }
    }

    const updateData = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      age: updateUserDto.age,
      role: updateUserDto.role,
    };

    const updatedUser = await this.usersRepository.update(id, updateData);
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    this.logger.log(`User updated successfully with ID: ${id}`);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Deleting user with ID: ${id}`);
    
    // Check if user exists
    await this.findUserById(id);
    
    const deleted = await this.usersRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    this.logger.log(`User deleted successfully with ID: ${id}`);
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    usersByRole: Record<string, number>;
  }> {
    this.logger.log('Getting user statistics');
    
    const users = await this.usersRepository.findAll(1000); // Get all users for stats
    const totalUsers = users.length;
    
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      usersByRole,
    };
  }
}