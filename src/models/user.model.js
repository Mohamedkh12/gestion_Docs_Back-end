const mongoose = require("mongoose")
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
    {
        firstname:{
            type:String,
            required:true,
            trim:true
        },
        lastname:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            trim:true,
            unique:true
        },
        password: String,
        memberships: [
            {
                workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'},
                role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
                permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
            }
        ],



    }
)

// Hash the password before saving
UserSchema.pre('save', async function(next) {
    try {

        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);

        next(); // Proceed to save
    } catch (error) {
        next(error); // Pass any errors to the next middleware
    }
});

//validation password
UserSchema.methods.isValidPassword = async function(password) {
    try {
        // Compare provided password with stored hash
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};
const User = mongoose.model('User', UserSchema);

module.exports = User;
