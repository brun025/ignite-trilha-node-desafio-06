import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let showUserProfileUseCase: ShowUserProfileUseCase;
let usersRepository: InMemoryUsersRepository;

describe("ShowUserProfileUseCase", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  })

  it("should be able to show user profile", async () => {
   const { id } = await usersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })
    const user_id = id as string

    const userProfile = await showUserProfileUseCase.execute(user_id)

    expect(userProfile).toMatchObject({
      id: expect.any(String),
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456",
    })
  });

  it("should not be able to show user profile with non existing user", async () => {
    await expect(
      showUserProfileUseCase.execute("non-existing-user")
    ).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
