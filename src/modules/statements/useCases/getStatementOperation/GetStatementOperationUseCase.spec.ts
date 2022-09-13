import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("GetStatementOperationUseCase", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  })

  it("should be able to get statement operation", async () => {
    const { id: user_id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });


   const {id: statement_id} = await statementsRepository.create({
      user_id: user_id as string,
      amount: 100,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })

    const response = await getStatementOperationUseCase.execute({
      user_id: user_id as string,
      statement_id: statement_id as string
    })

    expect(response).toMatchObject({
      id: statement_id,
      user_id,
      amount: 100,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })
  })

  it("should not be able to get statement operation with non-existing user", async () => {
    const { id: user_id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });


   const {id: statement_id} = await statementsRepository.create({
      user_id: user_id as string,
      amount: 100,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })

    await expect(
      getStatementOperationUseCase.execute({
        user_id: "non-existing-user",
        statement_id: statement_id as string,
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get statement operation with non-existing statement", async () => {
    const { id: user_id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user_id as string,
        statement_id: "non-existing-statement",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
