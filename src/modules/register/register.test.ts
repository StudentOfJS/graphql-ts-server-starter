import { request } from "graphql-request"
import { User } from "../../entity/User"
import { duplicateEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from "./errorMessages"
import { createTypeormConn } from "../../utils/createTypeormConn"



const email = "test2@test.com"
const password = "password"

const mutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}"){
      path
      message
    }
  }
`

beforeAll(async () => {
  await createTypeormConn()
})

describe("Register user", async () => {
  test("Check for duplicate emails", async () => {
    const response = await request(process.env.TEST_HOST as string, mutation(email, password))
    expect(response).toEqual({ register: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)

    const response2: any = await request(process.env.TEST_HOST as string, mutation(email, password))
    expect(response2.register).toHaveLength(1)
    expect(response2.register[0]).toEqual({
      path: "email",
      message: duplicateEmail
    })
  })

  test("Catch bad email", async () => {
    const response3: any = await request(process.env.TEST_HOST as string, mutation("b", password))
    expect(response3.register).toHaveLength(2)
    expect(response3).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        },
      ]
    })
  })

  test("Catch bad password", async () => {
    const response4: any = await request(process.env.TEST_HOST as string, mutation(email, "p"))
    expect(response4.register).toHaveLength(1)
    expect(response4).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough
        }
      ]
    })
  })

  test("Catch bad email and password", async () => {
    const response5: any = await request(process.env.TEST_HOST as string, mutation("e", "p"))
    expect(response5.register).toHaveLength(3)
    expect(response5).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: invalidEmail
        },
        {
          path: "password",
          message: passwordNotLongEnough
        },
      ]
    })
  })
})
