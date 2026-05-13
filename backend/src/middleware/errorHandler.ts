import { FastifyInstance, FastifyError } from 'fastify';
import { ZodError } from 'zod';

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | Error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Request validation failed',
        field: error.issues[0]?.path.join('.'),
      });
    }

    const statusCode = (error as FastifyError).statusCode;

    if (statusCode === 401) {
      return reply.status(401).send({ error: 'unauthorized', message: error.message });
    }

    if (statusCode === 403) {
      return reply.status(403).send({ error: 'forbidden', message: error.message });
    }

    if (statusCode === 404) {
      return reply.status(404).send({ error: 'not_found', message: error.message });
    }

    console.error(error);
    return reply.status(500).send({
      error: 'internal_error',
      message: 'An unexpected error occurred',
    });
  });
}
