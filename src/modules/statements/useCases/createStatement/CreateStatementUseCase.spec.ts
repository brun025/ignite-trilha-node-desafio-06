import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

describe("CreateStatementUseCase", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository,statementsRepository);
  })

  it("should be able to create new statement", async () => {
    const { id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });
    const user_id = id as string;

    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 1000,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })

    expect(statement).toMatchObject({
      id: expect.any(String),
      user_id,
      amount: 1000,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })
  });

  it("should be able to create new statement with type withdraw", async () => {
    const { id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });
    const user_id = id as string;

    await statementsRepository.create({
      user_id,
      amount: 10000,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })

    const statement = await createStatementUseCase.execute({
      user_id,
      amount: 1000,
      description: "lorem ipsum",
      type: OperationType.WITHDRAW,
    })

    expect(statement).toMatchObject({
      id: expect.any(String),
      user_id,
      amount: 1000,
      description: "lorem ipsum",
      type: OperationType.WITHDRAW,
    })
  });

  it("should not be able to create new statement with non existing user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "non-existing-user",
        amount: 1000,
        description: "lorem ipsum",
        type: OperationType.DEPOSIT,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it("should be able to create new statement type withdraw without balance", async () => {
    const { id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });
    const user_id = id as string;

    await statementsRepository.create({
      user_id,
      amount: 100,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })

     await expect(
       createStatementUseCase.execute({
        user_id,
        amount: 1000,
        description: "lorem ipsum",
        type: OperationType.WITHDRAW,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });

})
