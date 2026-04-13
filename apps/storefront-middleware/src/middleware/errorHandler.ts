// TODO: Global Express error handler middleware
// - Catches errors thrown in any route
// - Returns consistent { error: { message, code } } shape
// - Logs error details server-side
// - Never leaks stack traces to the client in production
