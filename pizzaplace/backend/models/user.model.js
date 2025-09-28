// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const itemCarrinhoSchema = new mongoose.Schema({
  produto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produto",
    required: true
  },
  quantidade: {
    type: Number,
    default: 1,
    min: 1
  },
  preco: {
    type: Number,
    default: 0
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined
  }
}, { _id: true });

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
    itensCarrinho: {
      type: [itemCarrinhoSchema],
      default: []
    },
    cargo:{
        type: String,
        enum: ["cliente", "admin"],
        default: "cliente"
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    verificado: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    verificationTokenExpire: Date 
}, {
    timestamps: true
});

// Hash password
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
