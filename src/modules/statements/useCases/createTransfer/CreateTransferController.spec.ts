import supertest from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";
import { createDatabaseConnection } from "../../../../database";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { StatementsRepository } from "../../repositories/StatementsRepository";

let connection: Connection;
let createUserUseCase: CreateUserUseCase;
let usersRepository: UsersRepository;
let statementsRepository: StatementsRepository;
let token: string;
let user_id: string;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

describe("CreateTransferController", () => {
  beforeAll(async() => {
    connection = await createDatabaseConnection();
  })

  beforeEach(async () => {
    await connection.runMigrations();

    usersRepository = new UsersRepository()
    statementsRepository = new StatementsRepository()
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

  it("should be able to create a new transfer", async() => {
    statementsRepository.create({
      user_id,
      amount: 100,
      type: OperationType.DEPOSIT,
      description: 'British Virgin Islands'
    });

    const { id: recipient_id } = await usersRepository.create({
      name: 'Jacob Lopez',
      email: 'riol@ce.dz',
      password: 'cXhuYVSh',
    });

    const { status, body } = await supertest(app).post(`/api/v1/statements/transfers/${recipient_id}`)
    .send({
      amount: 50,
      description: "lorem ipsum"
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(status).toEqual(201)
    expect(body).toMatchObject({
      id: expect.any(String),
      user_id,
      amount: 50,
      description: "lorem ipsum",
      type: OperationType.TRANSFER,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  });

  it("should not to be able to create new transfer", async () => {
    const { id: recipient_id } = await usersRepository.create({
      name: 'Jacob Lopez',
      email: 'riol@ce.dz',
      password: 'cXhuYVSh',
    });

    const { status, body } = await supertest(app).post(`/api/v1/statements/transfers/${recipient_id}`)
    .send({
      amount: 50,
      description: "lorem ipsum"
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(status).toEqual(400)
    expect(body).toMatchObject({
      message: 'Insufficient funds',
    })
  })
})
