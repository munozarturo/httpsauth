interface APIError {
    url: string;
    statusCode: number;
    statusMessage: string;
    message: string;
    stack: string;
}

export { type APIError };
