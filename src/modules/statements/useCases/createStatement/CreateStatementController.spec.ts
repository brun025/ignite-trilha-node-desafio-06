import supertest from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import { createDatabaseConnection } from "../../../../database";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";


let connection: Connection;
let createUserUseCase: CreateUserUseCase;
let usersRepository: UsersRepository;
let statementsRepository: StatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let token: string;
let user_id: string;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

describe("CreateStatementCOntroller", () => {
  beforeAll(async() => {
    connection = await createDatabaseConnection();
  })

  beforeEach(async () => {
    await connection.runMigrations();

    usersRepository = new UsersRepository()
    statementsRepository = new StatementsRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository);
    createStatementUseCase= new CreateStatementUseCase(usersRepository,statementsRepository)

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

  it("should be able to create a new statement type deposit", async () => {
    const { status, body } = await supertest(app).post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "lorem ipsum"
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(status).toEqual(201)
    expect(body).toMatchObject({
      id: expect.any(String),
      user_id,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: "lorem ipsum",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it("should be able to create a new statement type withdraw", async () => {
    await createStatementUseCase.execute({
      user_id,
      amount: 500,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })

    const { status, body } = await supertest(app).post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "lorem ipsum"
      })
      .set({
        Authorization: `Bearer ${token}`,
      })

    expect(status).toEqual(201)
    expect(body).toMatchObject({
      id: expect.any(String),
      user_id,
      amount: 100,
      type: OperationType.WITHDRAW,
      description: "lorem ipsum",
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it("should not be able to create new statement", async () => {
    await connection.query(`DELETE FROM users WHERE id = '${user_id}'`)

    const { status, body } = await supertest(app).post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "lorem ipsum"
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(status).toEqual(404)
    expect(body).toMatchObject({
      message: "User not found"
    })
  })
})
