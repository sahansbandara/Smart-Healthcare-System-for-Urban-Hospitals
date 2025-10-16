import mongoose, { Mongoose } from 'mongoose';

const { MONGODB_URI, NODE_ENV } = process.env;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

type ConnectionState = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: ConnectionState | undefined;
}

const globalState: ConnectionState = globalThis.__mongoose ?? {
  conn: null,
  promise: null,
};

globalThis.__mongoose = globalState;

export const mongooseInstance = mongoose;

export async function connectDB(): Promise<Mongoose> {
  if (globalState.conn) {
    return globalState.conn;
  }

  if (!globalState.promise) {
    if (NODE_ENV !== 'production') {
      console.info('[mongodb] connecting');
    }

    globalState.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxConnecting: 3,
    });
  }

  try {
    globalState.conn = await globalState.promise;

    if (NODE_ENV !== 'production') {
      console.info('[mongodb] connected');
    }

    return globalState.conn;
  } catch (error) {
    globalState.promise = null;
    if (NODE_ENV !== 'production') {
      console.error('[mongodb] connection error', error);
    }
    throw error;
  }
}

export default connectDB;
