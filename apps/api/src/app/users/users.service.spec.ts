import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersRepository, User } from "./users.repository";
import { CreateUserDto, UpdateUserDto } from "./dto/create-user.dto";
import { ObjectId } from "mongodb";

describe("UsersService", () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser: User = {
    _id: new ObjectId(),
    name: "John Doe",
    email: "john@example.com",
    age: 30,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createUser", () => {
    const createUserDto: CreateUserDto = {
      configType: "CREATE_USER",
      name: "Jane Doe",
      email: "jane@example.com",
      age: 25,
      role: "user",
    };

    it("should create a user successfully", async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);

      const result = await service.createUser(createUserDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        age: createUserDto.age,
        role: createUserDto.role,
      });
      expect(result).toEqual(mockUser);
    });

    it("should throw ConflictException if user already exists", async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("findUserById", () => {
    it("should return user if found", async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findUserById(mockUser._id!.toString());

      expect(repository.findById).toHaveBeenCalledWith(
        mockUser._id!.toString(),
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException if user not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findUserById("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findUserByEmail", () => {
    it("should return user if found", async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findUserByEmail(mockUser.email);

      expect(repository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findUserByEmail("nonexistent@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findAllUsers", () => {
    it("should return paginated users with total count", async () => {
      const users = [mockUser];
      repository.findAll.mockResolvedValue(users);
      repository.count.mockResolvedValue(1);

      const result = await service.findAllUsers(50, 0);

      expect(repository.findAll).toHaveBeenCalledWith(50, 0);
      expect(repository.count).toHaveBeenCalled();
      expect(result).toEqual({
        users,
        total: 1,
        limit: 50,
        skip: 0,
      });
    });

    it("should use default pagination values", async () => {
      repository.findAll.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      await service.findAllUsers();

      expect(repository.findAll).toHaveBeenCalledWith(50, 0);
    });
  });

  describe("updateUser", () => {
    const updateUserDto: UpdateUserDto = {
      configType: "UPDATE_USER",
      name: "Updated Name",
    };

    it("should update user successfully", async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue({
        ...mockUser,
        name: "Updated Name",
      });

      const result = await service.updateUser(
        mockUser._id!.toString(),
        updateUserDto,
      );

      expect(repository.findById).toHaveBeenCalledWith(
        mockUser._id!.toString(),
      );
      expect(repository.update).toHaveBeenCalledWith(mockUser._id!.toString(), {
        name: updateUserDto.name,
        email: updateUserDto.email,
        age: updateUserDto.age,
        role: updateUserDto.role,
      });
      expect(result.name).toBe("Updated Name");
    });

    it("should throw NotFoundException if user not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateUser("nonexistent", updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if email already in use", async () => {
      const updateDto = { ...updateUserDto, email: "existing@example.com" };
      const existingUser = { ...mockUser, _id: new ObjectId() };

      repository.findById.mockResolvedValue(mockUser);
      repository.findByEmail.mockResolvedValue(existingUser);

      await expect(
        service.updateUser(mockUser._id!.toString(), updateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue(true);

      await service.deleteUser(mockUser._id!.toString());

      expect(repository.findById).toHaveBeenCalledWith(
        mockUser._id!.toString(),
      );
      expect(repository.delete).toHaveBeenCalledWith(mockUser._id!.toString());
    });

    it("should throw NotFoundException if user not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.deleteUser("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("getUserStats", () => {
    it("should return user statistics", async () => {
      const users = [
        { ...mockUser, role: "admin" as const },
        { ...mockUser, role: "user" as const },
        { ...mockUser, role: "user" as const },
      ];
      repository.findAll.mockResolvedValue(users);

      const result = await service.getUserStats();

      expect(result).toEqual({
        totalUsers: 3,
        usersByRole: {
          admin: 1,
          user: 2,
        },
      });
    });

    it("should handle empty user list", async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.getUserStats();

      expect(result).toEqual({
        totalUsers: 0,
        usersByRole: {},
      });
    });
  });
});
