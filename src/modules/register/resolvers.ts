import { ResolverMap } from "../../types/graphql-utils"
import * as bcrypt from 'bcryptjs'
import * as yup from 'yup'
import { User } from "../../entity/User";
import { formatYupErrors } from "../../utils/formatYupError";

const schema = yup.object().shape({
  email: yup.string().min(3, "email too short").max(255, "too many characters in email").email(),
  password: yup.string().min(3, "password too short").max(255, "password too long"),
})
export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye"
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      const { email, password } = args
      try {
        await schema.validate(args, { abortEarly: false })
      } catch (error) {
        return formatYupErrors(error)
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"]
      })
      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: "already taken"
          }
        ]
      }
      const user = User.create({
        email,
        password: hashedPassword
      })
      await user.save()
      return null
    }
  }
}