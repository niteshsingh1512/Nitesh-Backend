import { response } from "express"

class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode<400
    }
}

// Informational responses - 100-199
// Succesfful response - 200-299
// Redirectional response - 300-399
// Client error - 400-499
// server error - 500-599