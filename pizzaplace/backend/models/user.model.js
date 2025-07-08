import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    nome:{
        type: String,
        required: [true, "O nome é obrigatório."]
    },
    email:{
        type: String,
        required: [true, "O email é obrigatório."],
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: [true, "O campo da password é obrigatório."],
        minlength: [6, "A password deve ter no mínimo 6 caracteres"] 
    },
    itensCarrinho:[
        {
            quantidade:{
                type: Number,
                default: 1
            },
            produto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Produto"
            }
        }
    ],
    cargo:{
        type: String,
        enum: ["cliente", "admin"],
        default: "cliente"
    }
}, {
    timestamps: true
});


//Hashar a password antes de a guardar na bd
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;