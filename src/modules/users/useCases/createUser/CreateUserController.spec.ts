import supertest from "supertest";
import { Connection } from "typeorm"
import { app } from "../../../../app";
import { createDatabaseConnection } from "../../../../database";
import { UsersRepository } from "../../repositories/UsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let connection: Connection;
let createUserUseCase: CreateUserUseCase;
let usersRepository: UsersRepository;

describe("CreateUserController", () => {
  beforeAll(async() => {
    connection = await createDatabaseConnection();
  })

  beforeEach(async () => {
    await connection.runMigrations();

    usersRepository = new UsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  afterEach(async () => {
    await connection.dropDatabase()
  })

  it("should be able to create a new user", async () => {
    const { body, status} = await supertest(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    const user = await usersRepository.findByEmail("johndoe@email.com")

    expect(status).toEqual(201)
    expect(body).toMatchObject({})
    expect(user).toMatchObject({
      id: expect.any(String),
      name: "John Doe",
      email: "johndoe@email.com",
      password: expect.any(String),
    })
  })

  it("should not be able to create a new user", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    const { body, status} = await supertest(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    expect(status).toEqual(400)
    expect(body).toMatchObject({
      message: "User already exists"
    })
  })
})
