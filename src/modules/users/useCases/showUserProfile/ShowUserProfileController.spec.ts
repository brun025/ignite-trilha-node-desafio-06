import supertest from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createDatabaseConnection } from "../../../../database";
import { UsersRepository } from "../../repositories/UsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let connection: Connection;
let createUserUseCase: CreateUserUseCase;
let usersRepository: UsersRepository;
let token: string;
let user_id: string;

describe("ShowUserProfileController", () => {
  beforeAll(async() => {
    connection = await createDatabaseConnection();
  })

  beforeEach(async () => {
    await connection.runMigrations();

    usersRepository = new UsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository);

    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    const { body } = await supertest(app).post("/api/v1/sessions").send({
      email: "johndoe@email.com",
      password: "123456",
    })

    token = body.token
    user_id = body.user.id
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close()
  })

  afterEach(async () => {
    await connection.dropDatabase()
  })

  it("should be able to show user profile", async () => {
    const { status, body} = await supertest(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`,
    })

    expect(status).toEqual(200)
    expect(body).toMatchObject({
      id: expect.any(String),
      name: "John Doe",
      email: "johndoe@email.com",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it("should not be able to show user profile", async () => {
    await connection.query(`DELETE FROM users WHERE id = '${user_id}'`)

    const { status, body} = await supertest(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`,
    })

    expect(status).toEqual(404)
    expect(body).toMatchObject({
      message: "User not found",
    })
  })
})
