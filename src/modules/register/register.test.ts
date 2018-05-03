import { request } from "graphql-request"
import { User } from "../../entity/User"
import { startServer } from "../../startServer"
import { duplicateEmail, emailNotLongEnough, inavlidEmail, passwordNotLongEnough } from "./errorMessages";

let getHost = () => ''

beforeAll(async () => {
  const app = await startServer()
  const { port } = app.address()
  getHost = () => `http://127.0.0.1:${port}`
})

const email = "rod@test.com"
const password = "password"

const mutation = (e: string = email, p: string = password) => `
  mutation {
    register(email: "${e}", password: "${p}"){
      path
      message
    }
  }
`
describe("Register user", async () => {
  test("User can be registered", async () => {
    const response = await request(getHost(), mutation())
    expect(response).toEqual({ register: null })
    const users = await User.find({ where: { email } })
    expect(users).toHaveLength(1)
    const user = users[0]
    expect(user.email).toEqual(email)
    expect(user.password).not.toEqual(password)

  })

  test("Check for duplicate emails", async () => {
    const response2: any = await request(getHost(), mutation())
    expect(response2.register).toHaveLength(1)
    expect(response2.register[0].path).toEqual("email")
    expect(response2).toEqual({
      register: [
        {
          path: "email",
          message: duplicateEmail
        }
      ]
    })
  })

  test("Catch bad email", async () => {
    const response3: any = await request(getHost(), mutation("b", password))
    expect(response3.register).toHaveLength(2)
    expect(response3).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: inavlidEmail
        },
      ]
    })
  })

  test("Catch bad password", async () => {
    const response4: any = await request(getHost(), mutation(email, "p"))
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
    const response5: any = await request(getHost(), mutation("e", "p"))
    expect(response5.register).toHaveLength(3)
    expect(response5).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough
        },
        {
          path: "email",
          message: inavlidEmail
        },
        {
          path: "password",
          message: passwordNotLongEnough
        },
      ]
    })
  })
})
