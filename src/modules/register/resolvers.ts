import * as yup from "yup"
// import { v4 } from 'uuid'
import { ResolverMap } from "../../types/graphql-utils"
import { User } from "../../entity/User"
import { formatYupError } from "../../utils/formatYupError"
import {
  duplicateEmail,
  emailNotLongEnough,
  invalidEmail,
  passwordNotLongEnough
} from "./errorMessages"
// uncomment to implement email confirmation
// import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink"
// import { sendEmail } from "../../utils/sendEmail";

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
    bye: () => "bye"
  },
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      // { redis, url }
    ) => {
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (err) {
        return formatYupError(err)
      }

      const { email, password } = args

      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      })

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail
          }
        ]
      }

      const user = User.create({
        email,
        password
      })

      await user.save()
      // process.env.NODE_ENV !== "test" ? await sendEmail(email, await createConfirmEmailLink(url, user.id, redis)) : null

      return null
    }
  }
}