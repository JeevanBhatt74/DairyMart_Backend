import { Request, Response } from "express";
import { AdminAccount } from "../models/admin_account.model";

export const getAdminBalance = async (req: Request, res: Response) => {
    try {
        let account = await AdminAccount.findOne();
        if (!account) {
            account = await AdminAccount.create({ balance: 0, totalRevenue: 0 });
        }

        res.status(200).json({
            success: true,
            data: account
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Error fetching admin balance"
        });
    }
};
