import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase"

let createTransferUseCase: CreateTransferUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

describe("CreateTransferUseCase", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createTransferUseCase = new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    )
  })

  it("should be able to create new transfer", async() => {
    const { id: sender_id } = await inMemoryUsersRepository.create({
      name: 'Jennie Dunn',
      email: 'tofto@dom.ao',
      password: 'D7JBmZly',
    });

    await inMemoryStatementsRepository.create({
      user_id: String(sender_id),
      amount: 100000,
      type: OperationType.DEPOSIT,
      description: 'British Virgin Islands'
    })

    const { id: recipient_id } = await inMemoryUsersRepository.create({
      name: 'Jacob Lopez',
      email: 'riol@ce.dz',
      password: 'cXhuYVSh',
    });

    const transfer = await createTransferUseCase.execute({
      recipient_id: String(recipient_id),
      sender_id: String(sender_id),
      amount: 100,
      description: 'Lesotho',
    })

    expect(transfer).toMatchObject({
      id: expect.any(String),
      user_id: sender_id,
      amount: 100,
      description: 'Lesotho',
      type: OperationType.TRANSFER,
    })
  });

  it("should not be able to create transfer with non existing sender user", async() => {
    const { id: recipient_id } = await inMemoryUsersRepository.create({
      name: 'Jacob Lopez',
      email: 'riol@ce.dz',
      password: 'cXhuYVSh',
    });

    await expect(
      createTransferUseCase.execute({
        sender_id: 'non-existing-serder-user',
        recipient_id: String(recipient_id),
        amount: 100,
        description: 'Lesotho',
      })
    ).rejects.toBeInstanceOf(CreateTransferError.SenderNotFound)
  })

  it("should not be able to create transfer with non existing recipient user", async() => {
    const { id: sender_id } = await inMemoryUsersRepository.create({
      name: 'Jennie Dunn',
      email: 'tofto@dom.ao',
      password: 'D7JBmZly',
    });

    await inMemoryStatementsRepository.create({
      user_id: String(sender_id),
      amount: 100000,
      type: OperationType.DEPOSIT,
      description: 'British Virgin Islands'
    })

    await expect(
      createTransferUseCase.execute({
        sender_id: String(sender_id),
        recipient_id: 'non-existing-recipient-user',
        amount: 100,
        description: 'Lesotho',
      })
    ).rejects.toBeInstanceOf(CreateTransferError.RecipientNotFound)
  });

  it("should not be able to create transfer with balance lower to amount", async () => {
    const { id: sender_id } = await inMemoryUsersRepository.create({
      name: 'Jennie Dunn',
      email: 'tofto@dom.ao',
      password: 'D7JBmZly',
    });

    await inMemoryStatementsRepository.create({
      user_id: String(sender_id),
      amount: 10,
      type: OperationType.DEPOSIT,
      description: 'British Virgin Islands'
    })

    const { id: recipient_id } = await inMemoryUsersRepository.create({
      name: 'Jacob Lopez',
      email: 'riol@ce.dz',
      password: 'cXhuYVSh',
    });

    await expect(
      createTransferUseCase.execute({
        recipient_id: String(recipient_id),
        sender_id: String(sender_id),
        amount: 100,
        description: 'Lesotho',
      })
    ).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds)
  })

  it("should not be able to create transfer without balance", async () => {
    const { id: sender_id } = await inMemoryUsersRepository.create({
      name: 'Jennie Dunn',
      email: 'tofto@dom.ao',
      password: 'D7JBmZly',
    });

    const { id: recipient_id } = await inMemoryUsersRepository.create({
      name: 'Jacob Lopez',
      email: 'riol@ce.dz',
      password: 'cXhuYVSh',
    });

    await expect(
      createTransferUseCase.execute({
        recipient_id: String(recipient_id),
        sender_id: String(sender_id),
        amount: 100,
        description: 'Lesotho',
      })
    ).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds)
  })
})
