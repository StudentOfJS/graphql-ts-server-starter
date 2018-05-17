import { createTypeormConn } from "../../utils/createTypeormConn"
import { User } from "../../entity/User"
import { Connection } from "typeorm"
import { TestClient } from "../../utils/testClient"
import { createForgotPasswordLink } from "../../utils/createForgotPasswordLink"
import * as Redis from "ioredis"

let conn: Connection
const email = "test@test.com"
const password = "pword"
const newPassword = "password"
const redis = new Redis()
let userId: string
beforeAll(async () => {
  conn = await createTypeormConn()
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save()
  userId = user.id
})

afterAll(async () => {
  conn.close()
})

describe("forgot password", () => {
  test("make sure forgot password works", async () => {
    const client = new TestClient(process.env.TEST_HOST as string)
    const url = await createForgotPasswordLink("", userId, redis)
    const parts = url.split('/')
    const key = parts[parts.length - 1]
    client.forgotPasswordChange(newPassword, key)
    const response = await client.login(email, password)
    expect(response.data).toEqual({
      forgotPasswordChange: null
    })
    const login = await client.login(email, newPassword)
    expect(login.data.login).toBeNull()
  })
})