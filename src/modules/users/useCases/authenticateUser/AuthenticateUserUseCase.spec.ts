import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepository: InMemoryUsersRepository;

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it("should be able to authenticate user", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })

    const authenticate = await authenticateUserUseCase.execute({
      email: "johndoe@email.com",
      password: "123456",
    })

    expect(authenticate).toMatchObject({
      user: {
        id: expect.any(String),
        name: "John Doe",
        email: "johndoe@email.com",
      },
      token: expect.any(String)
    })
  });

  it("should not be able to authenticate user with non existing user", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "non-existing-user",
        password: "123456",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it("should not be able to authenticate user with wrong password", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    });

    await expect(
      authenticateUserUseCase.execute({
        email: "johndoe@email.com",
        password: "wrong-password",
      })
    ).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
