import { Request,Response } from "express";
import { Permission } from "../../models/Permissions.model";


const getPermissions = async (req:Request,res:Response) : Promise<any>=>{

    const permissions = Permission.find();

    
    return res.status(201).json({
        success:true,
        message:'',
        payload: {data:permissions,pagination:{totalItems:20,pageNumber:10,currentPage:1}},

    })

}

export {getPermissions}