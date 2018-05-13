import axios from 'axios'
import { loginAndQueryMeTest, noCookieTest } from '../me/testUtils';

const logoutMutation = `
  mutation {
    logout
  }
`

describe("logout", () => {
  test("test logging out a user", async () => {
    await loginAndQueryMeTest()
    await axios.post(process.env.TEST_HOST as string, {
      query: logoutMutation
    },
      {
        withCredentials: true
      }
    )
    await noCookieTest(true)
  })
})