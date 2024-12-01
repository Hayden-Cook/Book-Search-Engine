// import the User model and the signToken function from the auth.js file in the utils folder
const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

// create the resolvers
const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return await User.findById(context.user._id).populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
// add the mutations
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },

        saveBook: async (parent, { book }, context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(
                    context.user._id,
                    { $addToSet: { savedBooks: book } },
                    { new: true, runValidators: true }
                ).populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

module.exports = resolvers;