import { Injectable, Inject } from "@nestjs/common";
import { MongoDbService, IMongoProvider } from "../database/mongodb.service";
import { CreateUserDto, UpdateUserDto } from "./dto/create-user.dto";
import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  age?: number;
  role: "admin" | "user" | "guest";
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersRepository {
  private readonly collectionName = "users";

  constructor(
    @Inject("IMongoProvider") private mongoProvider: IMongoProvider,
  ) {}

  async create(userData: Omit<CreateUserDto, "configType">): Promise<User> {
    const user: Omit<User, "_id"> = {
      name: userData.name,
      email: userData.email,
      age: userData.age,
      role: userData.role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = (this.mongoProvider as MongoDbService).getDatabase();
    const result = await db.collection(this.collectionName).insertOne(user);

    return {
      _id: result.insertedId,
      ...user,
    };
  }

  async findById(id: string): Promise<User | null> {
    const db = (this.mongoProvider as MongoDbService).getDatabase();
    return (await db
      .collection(this.collectionName)
      .findOne({ _id: new ObjectId(id) })) as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = (this.mongoProvider as MongoDbService).getDatabase();
    return (await db
      .collection(this.collectionName)
      .findOne({ email })) as User | null;
  }

  async findAll(limit: number = 50, skip: number = 0): Promise<User[]> {
    const db = (this.mongoProvider as MongoDbService).getDatabase();
    return (await db
      .collection(this.collectionName)
      .find({})
      .limit(limit)
      .skip(skip)
      .toArray()) as User[];
  }

  async update(
    id: string,
    updateData: Omit<UpdateUserDto, "configType">,
  ): Promise<User | null> {
    const db = (this.mongoProvider as MongoDbService).getDatabase();

    const updateDoc = {
      ...updateData,
      updatedAt: new Date(),
    };

    const result = await db
      .collection(this.collectionName)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateDoc },
        { returnDocument: "after" },
      );

    return result.value as User | null;
  }

  async delete(id: string): Promise<boolean> {
    const db = (this.mongoProvider as MongoDbService).getDatabase();
    const result = await db
      .collection(this.collectionName)
      .deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async count(): Promise<number> {
    const db = (this.mongoProvider as MongoDbService).getDatabase();
    return await db.collection(this.collectionName).countDocuments();
  }
}
