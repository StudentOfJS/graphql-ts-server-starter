import { request } from "graphql-request"
import { invalidLogin, confirmEmailError } from "./errorMessages"
import { User } from "../../entity/User"
import { createTypeormConn } from "../../utils/createTypeormConn"
import { Connection } from "typeorm"

const email = "test2@test.com"
const password = "password"
let conn: Connection

beforeAll(async () => {
  conn = await createTypeormConn()
})

afterAll(async () => {
  await conn.close()
})

const registerMutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}"){
      path
      message
    }
  }
`
const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}"){
      path
      message
    }
  }
`

const loginExpectError = async (e: string, p: string, errorMessage: string) => {
  const response = await request(process.env.TEST_HOST as string, loginMutation(e, p))
  expect(response).toEqual({
    login: [{
      path: "email",
      message: errorMessage
    }]
  })
}

describe("login test", () => {
  test("email not found returns error", async () => {
    await loginExpectError("error@test.com", password, invalidLogin);
  })
  test("email not confirmed", async () => {
    await request(process.env.TEST_HOST as string, registerMutation(email, password))
    await loginExpectError(email, password, confirmEmailError)
    await User.update({ email }, { confirmed: true })
    await loginExpectError(email, "bad password", invalidLogin)

    const response = await request(process.env.TEST_HOST as string, loginMutation(email, password))
    expect(response).toEqual({ login: null })
  })
})
