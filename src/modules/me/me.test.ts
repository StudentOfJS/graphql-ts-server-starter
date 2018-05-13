import { noCookieTest, loginAndQueryMeTest } from "./testUtils";


describe("me", () => {
  test("return null if no cookie", async () => {
    await noCookieTest(false)
  })
  test("get current user", async () => {
    await loginAndQueryMeTest()
  })
})