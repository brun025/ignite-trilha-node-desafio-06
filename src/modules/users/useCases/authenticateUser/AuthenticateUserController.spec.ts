import supertest from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createDatabaseConnection } from "../../../../database";
import { UsersRepository } from "../../repositories/UsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let connection: Connection;
let createUserUseCase: CreateUserUseCase;
let usersRepository: UsersRepository;

describe("AuthenticateUseController", () => {
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

  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    const { status, body } = await supertest(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    })

    expect(status).toEqual(200)
    expect(body).toMatchObject({
      user: {
        id: expect.any(String),
        name: "John Doe",
        email: "johndoe@email.com",
      },
      token: expect.any(String),
    })
  })

  it("should not be able to authenticate user", async () => {
    const { status, body } = await supertest(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    })

    expect(status).toEqual(401)
    expect(body).toMatchObject({
      message: "Incorrect email or password"
    })
  })
})
