import * as bcrypt from "bcryptjs"
import * as yup from 'yup'
import { ResolverMap } from "../../types/graphql-utils"
import { User } from "../../entity/User"
import { invalidLogin, confirmEmailError } from "./errorMessages"
import { userSessionIdPrefix } from "../../constants";

const errorResponse = [{
  path: "email",
  message: invalidLogin,
}]

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(invalidEmail),
  password: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
})

export const resolvers: ResolverMap = {
  Query: {
    dummy2: () => "dummy"
  },
  Mutation: {
    forgotPasswordChange: async (
      _,
      { email, password }: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } })
      if (!user) return errorResponse;
      if (!user.confirmed) {
        return [{
          path: "email",
          message: confirmEmailError,
        }]
      }
      const valid = await bcrypt.compare(password, user.password)
      if (!valid) return errorResponse;

      // login successful
      session.userId = user.id
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id}`, req.sessionID)
      }
      return null;
    }
  }
}