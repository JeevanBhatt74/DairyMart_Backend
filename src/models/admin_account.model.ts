import mongoose, { Schema, Document } from "mongoose";

export interface IAdminAccount extends Document {
    balance: number;
    totalRevenue: number;
    updatedAt: Date;
}

const AdminAccountSchema: Schema = new Schema(
    {
        balance: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Method to update balance safely
AdminAccountSchema.statics.addRevenue = async function (amount: number) {
    let account = await this.findOne();
    if (!account) {
        account = new this({ balance: 0, totalRevenue: 0 });
    }
    account.balance += amount;
    account.totalRevenue += amount;
    return account.save();
};

export interface IAdminAccountModel extends mongoose.Model<IAdminAccount> {
    addRevenue(amount: number): Promise<IAdminAccount>;
}

export const AdminAccount = mongoose.model<IAdminAccount, IAdminAccountModel>(
    "AdminAccount",
    AdminAccountSchema
);
