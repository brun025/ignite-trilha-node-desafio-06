import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase"

let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it("should be able to create new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    expect(user).toMatchObject({
      id: expect.any(String),
      name: "John Doe",
      email: "johndoe@email.com",
      password: expect.any(String),
    })
  })

  it("should not be able to create user with sam e-mail from another", async () => {
    await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    await expect(
      createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "123456",
      })
    ).rejects.toBeInstanceOf(CreateUserError)
  })
})
