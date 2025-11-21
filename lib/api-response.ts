import { NextResponse } from "next/server";

export interface ApiErrorResponse {
    error: string;
    code?: string;
    details?: Record<string, any>;
}

export class ApiError {
    static badRequest(message: string, details?: Record<string, any>): NextResponse<ApiErrorResponse> {
        return NextResponse.json(
            { error: message, code: "BAD_REQUEST", details },
            { status: 400 }
        );
    }

    static unauthorized(message: string = "Unauthorized"): NextResponse<ApiErrorResponse> {
        return NextResponse.json(
            { error: message, code: "UNAUTHORIZED" },
            { status: 401 }
        );
    }

    static forbidden(message: string = "Forbidden"): NextResponse<ApiErrorResponse> {
        return NextResponse.json(
            { error: message, code: "FORBIDDEN" },
            { status: 403 }
        );
    }

    static notFound(message: string = "Resource not found"): NextResponse<ApiErrorResponse> {
        return NextResponse.json(
            { error: message, code: "NOT_FOUND" },
            { status: 404 }
        );
    }

    static internal(message: string = "Internal server error", details?: Record<string, any>): NextResponse<ApiErrorResponse> {
        console.error("Internal server error:", message, details);
        return NextResponse.json(
            { error: message, code: "INTERNAL_ERROR", details },
            { status: 500 }
        );
    }

    static validationError(message: string, details?: Record<string, any>): NextResponse<ApiErrorResponse> {
        return NextResponse.json(
            { error: message, code: "VALIDATION_ERROR", details },
            { status: 422 }
        );
    }
}

export class ApiSuccess {
    static ok<T>(data: T, status: number = 200): NextResponse<T> {
        return NextResponse.json(data, { status });
    }

    static created<T>(data: T): NextResponse<T> {
        return NextResponse.json(data, { status: 201 });
    }

    static noContent(): NextResponse {
        return new NextResponse(null, { status: 204 });
    }
}
