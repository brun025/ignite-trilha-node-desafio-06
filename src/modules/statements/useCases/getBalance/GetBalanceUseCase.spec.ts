import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("GetBalanceUseCase", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  })

  it("should de able to get balance", async () => {
    const { id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });
    const user_id = id as string;

   const deposit = await statementsRepository.create({
      user_id,
      amount: 100,
      description: "lorem ipsum",
      type: OperationType.DEPOSIT,
    })

    const balance = await getBalanceUseCase.execute({
      user_id
    })

    expect(balance).toMatchObject({
      statement: [
        deposit
      ],
      balance: 100,
    })
  })

  it("should not be able to get balance with non existing user", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: "non-existing-user"
      })
    ).rejects.toBeInstanceOf(GetBalanceError)
  })
})
