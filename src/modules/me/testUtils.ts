import axios from 'axios'
import { Connection } from 'typeorm'
import { User } from '../../entity/User'
import { createTestConn } from '../../testUtils/createTestConn';
import * as faker from 'faker'

let userId: string
let conn: Connection
const email = faker.internet.email();
const password = faker.internet.password();

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}"){
      path
      message
    }
  }
`

const meQuery = `
  {
    me {
      id
      email
    }
  }
`

beforeAll(async () => {
  conn = await createTestConn()
  const user = await User.create({
    email,
    password,
    confirmed: true,
  }).save()
  userId = user.id
})
afterAll(async () => conn.close())

export const loginAndQueryMeTest = async () => {
  await axios.post(
    process.env.TEST_HOST as string,
    {
      query: loginMutation(email, password)
    },
    {
      withCredentials: true
    }
  )
  const response = await axios.post(
    process.env.TEST_HOST as string,
    {
      query: meQuery
    },
    {
      withCredentials: true
    }
  )
  expect(response.data.data.me.email).toEqual(email)
  expect(response.data.data.me.id).toEqual(userId)
}

export const noCookieTest = async (credentials: boolean) => {
  const response = await axios.post(
    process.env.TEST_HOST as string,
    {
      query: meQuery
    }, {
      withCredentials: credentials
    }
  )
  expect(response.data.data.me).toBeNull()
}