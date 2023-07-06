import { NextFunction, Response } from "express";
import Log from "./Log";
import ErrorResponse from "../utils/errorResponse";

type ErrorType = {
	// name: string;
	statusCode: number;
	message: string;
};

class Handler {
	public static errorHandler = (err: any, req: any, res: Response, next: NextFunction) => {
		let error: ErrorType = { ...err };
		error.message = err.message;
		console.log(error.message)

		if (err.code === 11000) {
			const message: string = "Duplicate Field Value";
			error = new ErrorResponse(message, 400);
		} else if (error.message === "payload has the incorrect shape. please check you types") {
			//need better types for this
			error = new ErrorResponse(error.message, 400);
		}

		res.status(error.statusCode || 400).json({
			success: false,
			error: error,
		});
	};

	// Error handling Middleware function reads the error message
	// and sends back a response in JSON format
	public static errorResponder = (error, request, response, next) => {
		response.header("Content-Type", "application/json");

		const status = error.status || 400;
		response.status(status).send(error.message);
	};

	// Fallback Middleware function for returning
	// 404 error for undefined paths
	public static invalidPathHandler = (request, response, next) => {
		response.status(404);
		response.send("invalid path");
	};

	public static logErrors(err, req, res, next): any {
		Log.error(err.stack);

		return next(err);
	}
}

export default Handler;
